import {AsyncStore} from "@perfice/stores/store";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {TrackableService} from "@perfice/services/trackable/trackable";

export class TrackableStore extends AsyncStore<Trackable[]> {

    private trackableService: TrackableService;

    constructor(initial: Promise<Trackable>, trackableService: TrackableService) {
        super(trackableService.getTrackables());
        this.trackableService = trackableService;
    }

    createTrackable(trackable: Trackable){
        this.trackableService.createTrackable(trackable);
        this.updateResolved(v => [...v, trackable]);
    }

}
