import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, type Readable} from "svelte/store";
import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {VariableValueStore} from "@perfice/stores/variable/value";
import type {Goal} from "@perfice/model/goal/goal";

export function GoalValueStore(goal: Goal,
                                    date: Date, weekStart: WeekStart, key: string, variableService: VariableService): Readable<Promise<PrimitiveValue>> {

    let store = VariableValueStore(goal.variableId,
            tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key);

    return derived(store, (value, set) => {
        set(new Promise(async (resolve) => {
            let resolved = await value;
            resolve(resolved as PrimitiveValue);
        }));
    });
}
