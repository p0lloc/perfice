import {pList, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {type Trackable, TrackableCardType, TrackableValueType} from "@perfice/model/trackable/trackable";
import {derived, get, type Readable, type Writable, writable} from "svelte/store";
import {RangedVariableValueStore, VariableValueStore} from "@perfice/stores/variable/value";
import {
    SimpleTimeScope,
    SimpleTimeScopeType,
    type TimeScope,
    tRange,
    tSimple,
    WeekStart
} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {addDaysDate} from "@perfice/util/time/simple";
import {goals, goalValue} from "@perfice/stores";
import type {GoalValueResult} from "@perfice/stores/goal/value";
import {emptyPromise, resolvedPromise} from "@perfice/util/promise";

function getTrackableTimeScope(trackable: Trackable, date: Date, weekStart: WeekStart): TimeScope {
    if (trackable.cardType == TrackableCardType.VALUE && trackable.cardSettings.type == TrackableValueType.LATEST) {
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
    if (chartStore) {
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
            if (chartStore) {
                resolve(pList((resolved as PrimitiveValue[])));
            } else {
                resolve(resolved as PrimitiveValue);
            }
        }));
    });
}

let cachedGoalValues: Map<string, GoalValueResult | null> = new Map();

export function fetchTrackableGoalValue(trackable: Trackable,
                                        date: Date, weekStart: WeekStart): Writable<Promise<GoalValueResult | null>> {


    const {subscribe, set, update} = writable<Promise<GoalValueResult | null>>(emptyPromise(), () => {
        return () => {
            cachedGoalValues.delete(trackable.id);
        }
    });

    let promise = new Promise<GoalValueResult | null>(async (resolve) => {
        let cached = cachedGoalValues.get(trackable.id);
        if (cached != null) {
            resolve(cached)
        }

        if (trackable.goalId == null) {
            resolve(null);
            return;
        }

        let goal = await goals.getGoalById(trackable.goalId, true);
        if (goal == null) {
            resolve(null);
            return;
        }

        const value = await get(goalValue(goal.variableId, "", date, weekStart, trackable.id));
        cachedGoalValues.set(trackable.id, value);
        if (cached == null) {
            resolve(resolvedPromise(value));
        } else {
            set(resolvedPromise(value));
        }
    });

    set(promise);
    return {
        subscribe,
        set,
        update
    }
}
