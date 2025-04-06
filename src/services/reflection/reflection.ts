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

export class ReflectionService {

    private reflectionCollection: ReflectionCollection;

    private formService: FormService;
    private journalService: JournalService;
    private tagService: TagService;
    private variableService: VariableService;
    private notificationService: NotificationService;

    constructor(reflectionCollection: ReflectionCollection, formService: FormService,
                journalService: JournalService, tagService: TagService, variableService: VariableService, notificationService: NotificationService) {
        this.reflectionCollection = reflectionCollection;
        this.formService = formService;
        this.journalService = journalService;
        this.tagService = tagService;
        this.variableService = variableService;
        this.notificationService = notificationService;
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

        return this.reflectionCollection.createReflection(reflection);
    }

    async updateReflection(reflection: Reflection): Promise<void> {
        let previous = await this.reflectionCollection.getReflectionById(reflection.id);
        if (previous == undefined) return;

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
                let variableUpdates = definition.updateDependencies(widget.dependencies,
                    previousWidget.settings, widget.settings);

                await updateDependencies(this.variableService, widget.dependencies,
                    structuredClone(previousWidget.dependencies), variableUpdates);

                previousWidgets = previousWidgets.filter(w => w.id != widget.id);
            }
        }

        for (let deletedWidget of previousWidgets) {
            // Delete all dependencies of this widget
            for (let dependencyId of Object.values(deletedWidget.dependencies)) {
                await this.variableService.deleteVariableById(dependencyId);
            }
        }

        return this.reflectionCollection.updateReflection(reflection);
    }

    async getNotificationsForReflection(reflectionId: string): Promise<StoredNotification[]> {
        return this.notificationService.getNotificationsByEntityId(reflectionId);
    }

    async createNotificationForReflection(reflectionId: string, hour: number,
                                          minutes: number, weekDay: number | null): Promise<StoredNotification> {
        return await this.notificationService.createNotification(
            NotificationType.REFLECTION,
            reflectionId,
            hour, minutes, weekDay
        );
    }

    async deleteReflectionById(id: string): Promise<void> {
        return this.reflectionCollection.deleteReflectionById(id);
    }

    async logReflection(reflection: Reflection, answers: Record<string, ReflectionWidgetAnswerState>) {
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

                    await this.journalService.logEntry(form, answers, form.format, new Date().getTime());
                    break;
                }
                case ReflectionWidgetType.TAGS: {
                    let tagIds = answerState.state.tags;
                    for (let tagId of tagIds) {
                        await this.tagService.logTag(tagId, new Date());
                    }
                    break;
                }
                case ReflectionWidgetType.TABLE: {
                    let widget = widgets.find(w => w.id == widgetId);
                    if (widget == null || widget.type != ReflectionWidgetType.TABLE) continue;

                    let form = await this.formService.getFormById(widget.settings.formId);
                    if (form == null) continue;

                    for (let answers of answerState.state.answers) {
                        await this.journalService.logEntry(form, answers, form.format, new Date().getTime());
                    }

                    break;
                }
                case ReflectionWidgetType.CHECKLIST: {
                    const data = answerState.state.data;

                    for (let value of data) {
                        switch (value.type) {
                            case ChecklistConditionType.FORM:
                                let form = await this.formService.getFormById(value.data.formId);
                                if (form == null) continue;

                                let answers: Record<string, PrimitiveValue> = convertAnswersToDisplay(value.data.answers, form.questions);

                                await this.journalService.logEntry(form, answers, form.format, new Date().getTime());
                                break;
                            case ChecklistConditionType.TAG:
                                await this.tagService.logTag(value.data.tagId, new Date());
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
}