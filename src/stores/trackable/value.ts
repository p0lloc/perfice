import {pList, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {type Trackable, TrackableCardType} from "@perfice/model/trackable/trackable";
import {derived, type Readable} from "svelte/store";
import {RangedVariableValueStore, VariableValueStore} from "@perfice/stores/variable/value";
import {SimpleTimeScope, SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";

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
            tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key);
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
