import {pList, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {type Trackable, TrackableCardType, TrackableValueType} from "@perfice/model/trackable/trackable";
import {derived, type Readable} from "svelte/store";
import {RangedVariableValueStore, VariableValueStore} from "@perfice/stores/variable/value";
import {
    RangeTimeScope,
    SimpleTimeScope,
    SimpleTimeScopeType,
    type TimeScope, tRange,
    tSimple,
    WeekStart
} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {addDaysDate} from "@perfice/util/time/simple";

function getTrackableTimeScope(trackable: Trackable, date: Date, weekStart: WeekStart): TimeScope {
    if(trackable.cardType == TrackableCardType.VALUE && trackable.cardSettings.type == TrackableValueType.LATEST){
        // For latest cards, get all entries up until the current day

        // Add 1 day to include the current day
        return tRange(null, addDaysDate(date, 1).getTime());
    }

    return tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime());
}

export function TrackableValueStore(trackable: Trackable,
                                    date: Date, weekStart: WeekStart, key: string, variableService: VariableService): Readable<Promise<PrimitiveValue>> {

    let store: Readable<Promise<PrimitiveValue>> | Readable<Promise<PrimitiveValue[]>>;
    let chartStore = trackable.cardType == TrackableCardType.CHART;
    if(chartStore) {
        let aggregateVariableId = trackable.dependencies["aggregate"];
        store = RangedVariableValueStore(aggregateVariableId,
            new SimpleTimeScope(SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key, 10);
    } else {
        store = VariableValueStore(trackable.dependencies["value"],
            getTrackableTimeScope(trackable, date, weekStart), variableService, key);
    }

    return derived(store, (values, set) => {
        set(new Promise(async (resolve) => {
            let resolved = await values;
            if(chartStore) {
                resolve(pList((resolved as PrimitiveValue[])));
            } else {
                resolve(resolved as PrimitiveValue);
            }
        }));
    });
}
