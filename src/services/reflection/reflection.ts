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

export class ReflectionService {

    private reflectionCollection: ReflectionCollection;

    private formService: FormService;
    private journalService: JournalService;
    private tagService: TagService;
    private variableService: VariableService;

    constructor(reflectionCollection: ReflectionCollection, formService: FormService,
                journalService: JournalService, tagService: TagService, variableService: VariableService) {
        this.reflectionCollection = reflectionCollection;
        this.formService = formService;
        this.journalService = journalService;
        this.tagService = tagService;
        this.variableService = variableService;
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
        let widgets = reflection.pages.flatMap(p => p.widgets);
        for (let widget of widgets) {
            let definition = getReflectionWidgetDefinition(widget.type);
            if (definition == null) continue;

            let dependencies = definition.updateDependencies(widget.dependencies, widget.settings, widget.settings);
            for (let [dependencyId, updatedType] of dependencies) {
                const variableId = widget.dependencies[dependencyId];
                if (variableId == undefined) {
                    // TODO: create new variable
                    continue;
                }
                const variable = this.variableService.getVariableById(variableId);
                if (variable == undefined) continue;

                variable.type = updatedType;
                console.log(variable);
                await this.variableService.updateVariable(variable);
                widget.dependencies[dependencyId] = variableId;
            }
        }
        // TODO: delete variables that are no longer returned by the definition
        return this.reflectionCollection.updateReflection(reflection);
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
            }
        }
    }
}