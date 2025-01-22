import type {TrackableCollection} from "@perfice/db/collections";
import {type VariableService} from "@perfice/services/variable/variable";
import type {Trackable} from "@perfice/model/trackable/trackable";
import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import type {FormService} from "@perfice/services/form/form";
import {FormQuestionDataType, FormQuestionDisplayType, type Form} from "@perfice/model/form/form";

export class TrackableService {
    private collection: TrackableCollection;
    private variableService: VariableService;
    private formService: FormService;

    constructor(collection: TrackableCollection, variableService: VariableService, formService: FormService) {
        this.collection = collection;
        this.variableService = variableService;
        this.formService = formService;
    }

    getTrackables(): Promise<Trackable[]> {
        return this.collection.getTrackables();
    }

    async createTrackable(trackable: Trackable): Promise<void> {

        let form: Form = {
            id: crypto.randomUUID(),
            name: trackable.name,
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
            ]
        }

        await this.formService.createForm(form);
        trackable.formId = form.id;
        let listVariable: Variable = {
            id: `${trackable.id}_list`,
            type: {
                type: VariableTypeName.LIST,
                value: new ListVariableType(trackable.formId, {
                    test: false,
                })
            }
        }
        let aggregateVariable: Variable = {
            id: trackable.id,
            type: {
                type: VariableTypeName.AGGREGATE,
                value: new AggregateVariableType(AggregateType.SUM, `${trackable.id}_list`, "test")
            }
        }


        trackable.dependencies = {
            value: listVariable.id,
            aggregate: aggregateVariable.id
        }

        await this.variableService.createVariable(listVariable);
        await this.variableService.createVariable(aggregateVariable);
        await this.collection.createTrackable(trackable);
    }

    async updateTrackable(trackable: Trackable) {
        await this.collection.updateTrackable(trackable);
    }

    async deleteTrackable(trackable: Trackable) {
        // Delete all variables associated with trackable
        for (let variableId of Object.values(trackable.dependencies)) {
            await this.variableService.deleteVariableById(variableId);
        }

        // Delete form associated with trackable
        await this.formService.deleteFormById(trackable.formId);
        await this.collection.deleteTrackableById(trackable.id);
    }

}
