import {type Readable, writable} from "svelte/store";
import type {DashboardTrackableWidgetSettings} from "@perfice/model/dashboard/widgets/trackable";
import type {Trackable} from "@perfice/model/trackable/trackable";
import {trackables} from "@perfice/stores";

export interface TrackableWidgetResult {
    trackable: Trackable;
}

export function TrackableWidget(settings: DashboardTrackableWidgetSettings): Readable<Promise<TrackableWidgetResult>> {
    return writable(new Promise(async (resolve) => {
        let trackable = await trackables.getTrackableById(settings.trackableId, true);
        if (trackable == null) return;

        resolve({trackable});
    }));
}