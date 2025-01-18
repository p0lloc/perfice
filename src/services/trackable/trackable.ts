import type {TrackableCollection} from "@perfice/db/collections";
import {type VariableService} from "@perfice/services/variable/variable";
import type {Trackable} from "@perfice/model/trackable/trackable";
import {VariableTypeName, type Variable} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";

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
            id: "test",
            type: {
                type: VariableTypeName.LIST,
                value: new ListVariableType(trackable.formId, {
                    test: false,
                })
            }
        }
        await this.variableService.createVariable(listVariable);
        await this.collection.createTrackable(trackable);
    }

}
