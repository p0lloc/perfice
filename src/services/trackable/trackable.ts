import type {TrackableCollection} from "@perfice/db/collections";
import {type VariableService} from "@perfice/services/variable/variable";
import type {Trackable} from "@perfice/model/trackable/trackable";
import {type TextOrDynamic, type Variable, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import type {FormService} from "@perfice/services/form/form";
import {FormQuestionDataType, FormQuestionDisplayType, type Form} from "@perfice/model/form/form";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";

export class TrackableService {
    private collection: TrackableCollection;
    private variableService: VariableService;
    private formService: FormService;

    private observers: EntityObservers<Trackable>;

    constructor(collection: TrackableCollection, variableService: VariableService, formService: FormService) {
        this.collection = collection;
        this.variableService = variableService;
        this.formService = formService;
        this.observers = new EntityObservers();
    }

    getTrackableById(id: string): Promise<Trackable | undefined> {
        return this.collection.getTrackableById(id);
    }

    getTrackables(): Promise<Trackable[]> {
        return this.collection.getTrackables();
    }

    async createTrackable(trackable: Trackable): Promise<void> {
        let form: Form = {
            id: crypto.randomUUID(),
            name: trackable.name,
            icon: "star",
            snapshotId: "",
            questions: [
                {
                    id: "test",
                    name: "test",
                    displayType: FormQuestionDisplayType.INPUT,
                    displaySettings: {},
                    dataType: FormQuestionDataType.NUMBER,
                    dataSettings: {
                        min: null,
                        max: null,
                    }
                },
                {
                    id: "test2",
                    name: "test2",
                    displayType: FormQuestionDisplayType.INPUT,
                    displaySettings: {},
                    dataType: FormQuestionDataType.NUMBER,
                    dataSettings: {
                        min: null,
                        max: null,
                    }
                }
            ]
        }

        await this.formService.createForm(form);
        trackable.formId = form.id;
        let listVariable: Variable = {
            id: `${trackable.id}_list`,
            name: trackable.name,
            type: {
                type: VariableTypeName.LIST,
                value: new ListVariableType(trackable.formId, {
                    test: false,
                }, [])
            }
        }

        let aggregateVariable: Variable = {
            id: trackable.id,
            name: trackable.name,
            type: {
                type: VariableTypeName.AGGREGATE,
                value: new AggregateVariableType(AggregateType.SUM, listVariable.id, "test")
            }
        }


        trackable.dependencies = {
            value: listVariable.id,
            aggregate: aggregateVariable.id
        }

        await this.variableService.createVariable(listVariable);
        await this.variableService.createVariable(aggregateVariable);
        await this.collection.createTrackable(trackable);
        await this.observers.notifyObservers(EntityObserverType.CREATED, trackable);
    }

    async updateTrackable(trackable: Trackable) {
        let previous = await this.getTrackableById(trackable.id);
        if (previous == null) return;

        await this.updateTrackableForm(previous, trackable);
        await this.collection.updateTrackable(trackable);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, trackable);
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

    private extractFieldsFromRepresentation(representation: TextOrDynamic[]): Record<string, boolean> {
        let fields: Record<string, boolean> = {};
        for (let part of representation) {
            if (!part.dynamic) continue;

            fields[part.value] = true;
        }

        return fields;
    }

    async updateTrackableValueSettings(trackable: Trackable, representation: TextOrDynamic[]) {
        let listVariable = this.variableService.getVariableById(trackable.dependencies["value"]);
        if (listVariable == null || listVariable.type.type != VariableTypeName.LIST) return;

        let fields = this.extractFieldsFromRepresentation(representation);
        listVariable.type = {
            type: VariableTypeName.LIST,
            value: new ListVariableType(trackable.formId, fields, listVariable.type.value.getFilters())
        }

        await this.variableService.updateVariable(listVariable);
        trackable.cardSettings = {representation};
    }
}
