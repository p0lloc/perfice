import type {TrackableCollection} from "@perfice/db/collections";
import {type VariableService} from "@perfice/services/variable/variable";
import type {Trackable} from "@perfice/model/trackable/trackable";
import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";

export class TrackableService {
    private collection: TrackableCollection;
    private variableService: VariableService;

    constructor(collection: TrackableCollection, variableService: VariableService) {
        this.collection = collection;
        this.variableService = variableService;
    }

    getTrackables(): Promise<Trackable[]> {
        return this.collection.getTrackables();
    }

    async createTrackable(trackable: Trackable): Promise<void> {
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

}
