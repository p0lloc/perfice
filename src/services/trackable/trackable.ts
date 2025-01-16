import type {TrackableCollection} from "@perfice/db/collections";
import {type VariableService} from "@perfice/services/variable/variable";
import type {Trackable} from "@perfice/model/trackable/trackable";

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

    createTrackable(trackable: Trackable) {

    }
}
