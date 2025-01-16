import type {Trackable} from "@perfice/model/trackable/trackable";

export interface TrackableCollection {
    getTrackables(): Promise<Trackable[]>;
    createTrackable(trackable: Trackable): Promise<void>;
    updateTrackable(trackable: Trackable): Promise<void>;
    deleteTrackableById(trackableId: string): Promise<void>;
}
