import type {TrackableCollection} from "@perfice/db/collections";
import {type VariableService} from "@perfice/services/variable/variable";
import {
    type Trackable,
    type TrackableCardSettings,
    TrackableCardType,
    type TrackableCategory,
    TrackableValueType
} from "@perfice/model/trackable/trackable";
import {
    type TextOrDynamic,
    type Variable,
    type VariableTypeDef,
    VariableTypeName
} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import type {FormService} from "@perfice/services/form/form";
import {type Form, FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {AnalyticsSettingsService} from "@perfice/services/analytics/settings";
import {parseTrackableSuggestion, type TrackableSuggestion} from "@perfice/model/trackable/suggestions";
import {questionDataTypeRegistry} from "@perfice/model/form/data";

export interface TrackableEntityProvider {
    getTrackables(): Promise<Trackable[]>;
}

export class TrackableService implements TrackableEntityProvider {
    private collection: TrackableCollection;
    private variableService: VariableService;
    private formService: FormService;

    private observers: EntityObservers<Trackable>;
    private analyticsSettingsService: AnalyticsSettingsService;

    constructor(collection: TrackableCollection, variableService: VariableService,
                formService: FormService, analyticsSettingsService: AnalyticsSettingsService) {
        this.collection = collection;
        this.variableService = variableService;
        this.formService = formService;
        this.observers = new EntityObservers();
        this.analyticsSettingsService = analyticsSettingsService;
    }

    getTrackableById(id: string): Promise<Trackable | undefined> {
        return this.collection.getTrackableById(id);
    }

    getTrackables(): Promise<Trackable[]> {
        return this.collection.getTrackables();
    }

    async createTrackableFromSuggestion(suggestion: TrackableSuggestion, categoryId: string | null = null): Promise<{
        trackable: Trackable,
        form: Form,
        assignedQuestions: Map<string, string>
    }> {
        let [trackable, form, assignedQuestions] = parseTrackableSuggestion(suggestion);
        await this.formService.createForm(form);

        return {
            trackable: await this.createTrackable(suggestion.name, suggestion.icon, form, trackable, categoryId),
            form,
            assignedQuestions
        };
    }

    async createSingleValueTrackable(categoryId: string | null, name: string, icon: string, type: FormQuestionDataType) {
        const mainQuestionId = crypto.randomUUID();

        let dataDef = questionDataTypeRegistry.getDefinition(type);
        if (dataDef == null) return;

        let dataSettings = {
            dataType: type,
            dataSettings: dataDef.getDefaultSettings()
        }

        let form: Form = {
            id: crypto.randomUUID(),
            name,
            icon,
            snapshotId: crypto.randomUUID(),
            format: [
                {
                    dynamic: true,
                    value: mainQuestionId
                }
            ],
            questions: [
                {
                    id: mainQuestionId,
                    name: name,
                    unit: null,
                    displayType: FormQuestionDisplayType.INPUT,
                    defaultValue: null,
                    displaySettings: {},
                    ...dataSettings
                }
            ]
        }

        await this.formService.createForm(form);
        await this.createTrackable(name, icon, form, this.createSingleValueCardSettings(type, mainQuestionId), categoryId);
    }

    async createTrackableFromForm(form: Form, categoryId: string | null) {
        await this.createTrackable(form.name, form.icon, form, {
            cardType: TrackableCardType.VALUE,
            cardSettings: {
                representation: form.format,
                type: TrackableValueType.TABLE,
                settings: {}
            }
        }, categoryId);
    }

    async createTrackable(name: string, icon: string, form: Form, card: TrackableCardSettings,
                          categoryId: string | null = null): Promise<Trackable> {

        let trackableCount = await this.collection.count();
        let cardSettings: TrackableCardSettings = {
            cardSettings: card.cardSettings,
            cardType: card.cardType
        } as TrackableCardSettings;

        const trackableId = crypto.randomUUID();
        const dependencies: Record<string, string> = {
            value: `t_${trackableId}_list`,
            aggregate: `t_${trackableId}_aggregate`
        }

        let trackable: Trackable = {
            id: trackableId,
            name,
            icon,
            order: trackableCount, // Place the trackable at the end of the list
            formId: form.id,
            categoryId: categoryId,
            ...cardSettings,
            dependencies
        };

        await this.analyticsSettingsService.createAnalyticsSettingsFromForm(form.id, form.questions);

        let listVariable: Variable = {
            id: dependencies["value"],
            type: this.createListVariableTypeDef(form.id, card),
            name: ""
        }

        let aggregateVariable: Variable = {
            id: dependencies["aggregate"],
            type: this.createAggregateVariableTypeDef(card, dependencies),
            name: ""
        }

        await this.variableService.createVariable(listVariable);
        await this.variableService.createVariable(aggregateVariable);
        await this.collection.createTrackable(trackable);
        await this.observers.notifyObservers(EntityObserverType.CREATED, trackable);
        return trackable;
    }

    async updateTrackable(trackable: Trackable) {
        let previous = await this.getTrackableById(trackable.id);
        if (previous == null) return;

        await this.updateTrackableForm(previous, trackable);
        await this.updateTrackableVariables(trackable);
        await this.collection.updateTrackable(trackable);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, trackable);
    }

    async updateTrackableVariables(trackable: Trackable) {
        let listVariable = this.variableService.getVariableById(trackable.dependencies["value"]);
        if (listVariable == null) return;

        let aggregateVariable = this.variableService.getVariableById(trackable.dependencies["aggregate"]);
        if (aggregateVariable == null) return;

        listVariable.type = this.createListVariableTypeDef(trackable.formId, trackable);
        aggregateVariable.type = this.createAggregateVariableTypeDef(trackable, trackable.dependencies);

        await this.variableService.updateVariable(listVariable);
        await this.variableService.updateVariable(aggregateVariable);
    }

    private async updateTrackableForm(previous: Trackable, trackable: Trackable) {
        if (trackable.name != previous.name || trackable.icon != previous.icon) {
            let form = await this.formService.getFormById(trackable.formId);
            if (form == null) return;

            form.name = trackable.name;
            form.icon = trackable.icon;
            await this.formService.updateForm(form, false);
        }
    }

    async deleteTrackable(trackable: Trackable) {
        // Delete all variables associated with trackable
        for (let variableId of Object.values(trackable.dependencies)) {
            await this.variableService.deleteVariableById(variableId);
        }

        // Delete form associated with trackable
        await this.formService.deleteFormById(trackable.formId);
        await this.collection.deleteTrackableById(trackable.id);
        await this.observers.notifyObservers(EntityObserverType.DELETED, trackable);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Trackable>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Trackable>) {
        this.observers.removeObserver(type, callback);
    }

    private extractFieldsFromRepresentation(representation: TextOrDynamic[]): Record<string, boolean> {
        let fields: Record<string, boolean> = {};
        for (let part of representation) {
            if (!part.dynamic) continue;

            fields[part.value] = true;
        }

        return fields;
    }

    /*
    async updateTrackableChartSettings(trackable: Trackable, aggregateType: AggregateType, field: string, color: string) {
        let listVariable = this.variableService.getVariableById(trackable.dependencies["value"]);
        if (listVariable == null || listVariable.type.type != VariableTypeName.LIST) return;

        listVariable.type = {
            type: VariableTypeName.LIST,
            value: new ListVariableType(trackable.formId, {
                [field]: false
            }, listVariable.type.value.getFilters())
        }

        let chartVariable = this.variableService.getVariableById(trackable.dependencies["aggregate"]);
        if (chartVariable == null) return;

        chartVariable.type = {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(aggregateType, listVariable.id, field)
        }

        trackable.cardSettings = {
            color
        }

        // TODO: could we update both variables in conjunction to avoid spamming index listeners?
        await this.variableService.updateVariable(listVariable);
        await this.variableService.updateVariable(chartVariable);
    }
    async updateTrackableValueSettings(trackable: Trackable, cardSettings: EditTrackableValueSettings) {
        let listVariable = this.variableService.getVariableById(trackable.dependencies["value"]);
        if (listVariable == null || listVariable.type.type != VariableTypeName.LIST) return;

        let fields = this.extractFieldsFromRepresentation(cardSettings.representation);
        listVariable.type = {
            type: VariableTypeName.LIST,
            value: new ListVariableType(trackable.formId, fields, listVariable.type.value.getFilters())
        }

        await this.variableService.updateVariable(listVariable);
        trackable.cardSettings = cardSettings;
    }

    async updateTrackableTallySettings(trackable: Trackable, cardSettings: EditTrackableTallySettings) {
        let listVariable = this.variableService.getVariableById(trackable.dependencies["value"]);
        if (listVariable == null || listVariable.type.type != VariableTypeName.LIST) return;

        // Update list variable to fetch answer for the specified question id
        listVariable.type = {
            type: VariableTypeName.LIST,
            value: new ListVariableType(trackable.formId, {
                [cardSettings.questionId]: false
            }, [])
        }

        await this.variableService.updateVariable(listVariable);
        trackable.cardSettings = cardSettings;
    }*/

    async reorderTrackables(category: TrackableCategory | null, trackables: Trackable[]) {
        for (let i = 0; i < trackables.length; i++) {
            trackables[i].order = i;

            // Category might have changed, update it
            trackables[i].categoryId = category?.id ?? null;
        }

        await this.collection.updateTrackables(trackables);
    }


    private createListVariableTypeDef(formId: string, card: TrackableCardSettings): VariableTypeDef {
        switch (card.cardType) {
            case TrackableCardType.CHART: {
                let cardSettings = card.cardSettings;
                return {
                    type: VariableTypeName.LIST,
                    value: new ListVariableType(formId, {
                        [cardSettings.field]: false
                    }, [])
                }
            }
            case TrackableCardType.TALLY: {
                let cardSettings = card.cardSettings;
                return {
                    type: VariableTypeName.LIST,
                    value: new ListVariableType(formId, {
                        [cardSettings.field]: false
                    }, [])
                }
            }
            case TrackableCardType.VALUE: {
                let cardSettings = card.cardSettings;
                let fields = this.extractFieldsFromRepresentation(cardSettings.representation);
                return {
                    type: VariableTypeName.LIST,
                    value: new ListVariableType(formId, fields, [])
                }
            }
        }
    }

    private createAggregateVariableTypeDef(card: TrackableCardSettings, dependencies: Record<string, string>): VariableTypeDef {
        let listVariableId = dependencies["value"];
        switch (card.cardType) {
            case TrackableCardType.CHART: {
                let cardSettings = card.cardSettings;
                return {
                    type: VariableTypeName.AGGREGATE,
                    value: new AggregateVariableType(cardSettings.aggregateType, listVariableId, cardSettings.field)
                }
            }
            default: {
                return {
                    type: VariableTypeName.AGGREGATE,
                    value: new AggregateVariableType(AggregateType.SUM, listVariableId, "")
                }
            }
        }
    }

    private createSingleValueCardSettings(type: FormQuestionDataType, mainQuestionId: string): TrackableCardSettings {
        switch (type) {
            case FormQuestionDataType.NUMBER:
            case FormQuestionDataType.TIME_ELAPSED:
                return {
                    cardType: TrackableCardType.CHART,
                    cardSettings: {
                        aggregateType: AggregateType.SUM,
                        field: mainQuestionId,
                        color: "#ff0000"
                    }
                }
            default:
                return {
                    cardType: TrackableCardType.VALUE,
                    cardSettings: {
                        representation: [
                            {
                                dynamic: true,
                                value: mainQuestionId
                            }
                        ],
                        type: TrackableValueType.TABLE,
                        settings: {}
                    }
                }
        }
    }

    async onTrackableCategoryDeleted(category: TrackableCategory) {
        let trackables = await this.collection.getTrackablesByCategoryId(category.id);
        for (let trackable of trackables) {
            console.log("Deleting trackable", trackable);
            await this.deleteTrackable(trackable);
        }
    }

}
