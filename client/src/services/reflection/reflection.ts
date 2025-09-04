import type {ReflectionCollection} from "@perfice/db/collections";
import {
    getReflectionWidgetDefinition,
    type Reflection,
    type ReflectionWidgetAnswerState,
    ReflectionWidgetType
} from "@perfice/model/reflection/reflection";
import type {JournalService} from "@perfice/services/journal/journal";
import type {FormService} from "@perfice/services/form/form";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {convertAnswersToDisplay} from "@perfice/model/form/validation";
import type {TagService} from "../tag/tag";
import type {VariableService} from "@perfice/services/variable/variable";
import {updateDependencies} from "@perfice/services/variable/dependencies";
import {ChecklistConditionType} from "@perfice/model/sharedWidgets/checklist/checklist";
import type {NotificationService} from "../notification/notification";
import {NotificationType, type StoredNotification} from "@perfice/model/notification/notification";
import {type EntityObserverCallback, EntityObservers} from "../observer";
import {EntityObserverType} from "@perfice/services/observer";

export class ReflectionService {

    private reflectionCollection: ReflectionCollection;

    private formService: FormService;
    private journalService: JournalService;
    private tagService: TagService;
    private readonly variableService: VariableService;
    private notificationService: NotificationService;

    private observers: EntityObservers<Reflection>;

    constructor(reflectionCollection: ReflectionCollection, formService: FormService,
                journalService: JournalService, tagService: TagService, variableService: VariableService, notificationService: NotificationService) {
        this.reflectionCollection = reflectionCollection;
        this.formService = formService;
        this.journalService = journalService;
        this.tagService = tagService;
        this.variableService = variableService;
        this.notificationService = notificationService;
        this.observers = new EntityObservers();
    }

    async getReflections(): Promise<Reflection[]> {
        return this.reflectionCollection.getReflections();
    }

    async getReflectionById(id: string): Promise<Reflection | undefined> {
        return this.reflectionCollection.getReflectionById(id);
    }

    async createReflection(reflection: Reflection): Promise<void> {

        let widgets = reflection.pages.flatMap(p => p.widgets);
        for (let widget of widgets) {
            let definition = getReflectionWidgetDefinition(widget.type);
            if (definition == null) continue;

            let dependencies = definition.createDependencies(widget.settings);
            for (let [key, variable] of dependencies) {
                await this.variableService.createVariable(variable);
                widget.dependencies[key] = variable.id;
            }
        }

        await this.observers.notifyObservers(EntityObserverType.CREATED, reflection);
        return this.reflectionCollection.createReflection(reflection);
    }

    async updateReflection(reflection: Reflection): Promise<void> {
        let previous = await this.reflectionCollection.getReflectionById(reflection.id);
        if (previous == undefined) return;

        await this.updateNotifications(previous, reflection);
        await this.updateWidgetDependencies(previous, reflection);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, reflection);
        return this.reflectionCollection.updateReflection(reflection);
    }

    private async updateNotifications(previous: Reflection, reflection: Reflection) {
        // Don't update notifications if the name didn't change
        if (previous.name == reflection.name) return;

        let notifications = await this.notificationService.getNotificationsByEntityId(reflection.id);

        // Update notifications to match new reflection name
        for (let notification of notifications) {
            await this.notificationService.updateNotification({
                ...notification,
                title: reflection.name,
            });
        }
    }

    private async updateWidgetDependencies(previous: Reflection, reflection: Reflection) {

        let widgets = reflection.pages.flatMap(p => p.widgets);
        let previousWidgets = previous.pages.flatMap(p => p.widgets);

        for (let widget of widgets) {
            let definition = getReflectionWidgetDefinition(widget.type);
            if (definition == null) continue;

            let previousWidget = previousWidgets.find(w => w.id == widget.id);

            if (previousWidget == undefined) {
                // This widget was created, so we need to create all dependencies
                let dependencies = definition.createDependencies(widget.settings);
                for (let [key, variable] of dependencies) {
                    await this.variableService.createVariable(variable);
                    widget.dependencies[key] = variable.id;
                }
            } else {
                // Update dependencies
                let variableUpdates = definition.createDependencies(widget.settings);
                await updateDependencies(this.variableService, widget.dependencies, previousWidget.dependencies, variableUpdates);

                previousWidgets = previousWidgets.filter(w => w.id != widget.id);
            }
        }

        for (let deletedWidget of previousWidgets) {
            // Delete all dependencies of this widget
            for (let dependencyId of Object.values(deletedWidget.dependencies)) {
                await this.variableService.deleteVariableById(dependencyId);
            }
        }
    }

    async getNotificationsForReflection(reflectionId: string): Promise<StoredNotification[]> {
        return this.notificationService.getNotificationsByEntityId(reflectionId);
    }

    async createNotificationForReflection(reflectionId: string,
                                          hour: number, minutes: number, weekDay: number | null): Promise<StoredNotification> {
        let reflection = await this.getReflectionById(reflectionId);
        if (reflection == undefined) throw new Error("Reflection not found");

        return await this.notificationService.createNotification(
            NotificationType.REFLECTION,
            reflectionId,
            reflection.name,
            "Reflect on your day",
            hour, minutes, weekDay
        );
    }

    async deleteReflectionById(id: string): Promise<void> {
        let reflection = await this.reflectionCollection.getReflectionById(id);
        if (reflection == null) return;

        await this.notificationService.deleteNotificationsByEntityId(id);
        await this.reflectionCollection.deleteReflectionById(id);
        await this.observers.notifyObservers(EntityObserverType.DELETED, reflection);
    }

    async logReflection(reflection: Reflection, answers: Record<string, ReflectionWidgetAnswerState>, date: Date) {
        let widgets = reflection.pages.flatMap(p => p.widgets);
        for (let [widgetId, answerState] of Object.entries(answers)) {
            // TODO: this logic could be moved to the definitions themselves
            switch (answerState.type) {
                case ReflectionWidgetType.FORM: {
                    let widget = widgets.find(w => w.id == widgetId);
                    if (widget == null || widget.type != ReflectionWidgetType.FORM) continue;

                    let form = await this.formService.getFormById(widget.settings.formId);
                    if (form == null) continue;

                    let answers: Record<string, PrimitiveValue> = convertAnswersToDisplay(answerState.state.answers, form.questions);

                    await this.journalService.logEntry(form, answers, form.format, date.getTime());
                    break;
                }
                case ReflectionWidgetType.TAGS: {
                    let tagIds = answerState.state.tags;
                    for (let tagId of tagIds) {
                        await this.tagService.logTag(tagId, date);
                    }
                    break;
                }
                case ReflectionWidgetType.TABLE: {
                    let widget = widgets.find(w => w.id == widgetId);
                    if (widget == null || widget.type != ReflectionWidgetType.TABLE) continue;

                    let form = await this.formService.getFormById(widget.settings.formId);
                    if (form == null) continue;

                    for (let answers of answerState.state.answers) {
                        await this.journalService.logEntry(form, answers, form.format, date.getTime());
                    }

                    break;
                }
                case ReflectionWidgetType.CHECKLIST: {
                    const data = answerState.state.data;

                    for (let value of data) {
                        switch (value.type) {
                            case ChecklistConditionType.FORM:
                                if (value.unchecked) {
                                    await this.journalService.deleteEntryById(value.id);
                                } else {
                                    let form = await this.formService.getFormById(value.data.formId);
                                    if (form == null) continue;

                                    let answers: Record<string, PrimitiveValue> = convertAnswersToDisplay(value.data.answers, form.questions);

                                    await this.journalService.logEntry(form, answers, form.format, date.getTime());
                                }
                                break;
                            case ChecklistConditionType.TAG:
                                if (value.unchecked) {
                                    await this.tagService.unlogTagEntry(value.id);
                                } else {
                                    await this.tagService.logTag(value.data.tagId, date);
                                }
                                break;
                        }
                    }
                    break;
                }
            }
        }
    }

    async deleteNotification(id: string) {
        await this.notificationService.deleteNotificationById(id);
    }

    async updateNotification(notification: StoredNotification) {
        await this.notificationService.updateNotification(notification);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Reflection>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Reflection>) {
        this.observers.removeObserver(type, callback);
    }

}