import {AsyncStore} from "@perfice/stores/store";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {TrackableService} from "@perfice/services/trackable/trackable";

export class TrackableStore extends AsyncStore<Trackable[]> {

    private trackableService: TrackableService;

    constructor(trackableService: TrackableService) {
        super(trackableService.getTrackables());
        this.trackableService = trackableService;
    }

    async createTrackable(trackable: Trackable): Promise<void> {
        await this.trackableService.createTrackable(trackable);
        this.updateResolved(v => [...v, trackable]);
    }

}
