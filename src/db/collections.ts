import type {Trackable} from "@perfice/model/trackable/trackable";
import type {StoredVariable, Variable} from "@perfice/model/variable/variable";

export interface TrackableCollection {
    getTrackables(): Promise<Trackable[]>;
    createTrackable(trackable: Trackable): Promise<void>;
    updateTrackable(trackable: Trackable): Promise<void>;
    deleteTrackableById(trackableId: string): Promise<void>;
}
export interface VariableCollection {
    getVariables(): Promise<StoredVariable[]>;
    getVariableById(id: string): Promise<StoredVariable | undefined>;
}
