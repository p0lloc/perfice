import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, type Readable} from "svelte/store";
import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {VariableValueStore} from "@perfice/stores/variable/value";
import type {Goal} from "@perfice/model/goal/goal";

export function GoalValueStore(goal: Goal,
                               date: Date, weekStart: WeekStart, key: string, variableService: VariableService): Readable<Promise<Record<string, PrimitiveValue>>> {

    let store = VariableValueStore(goal.variableId,
        tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key);

    return derived(store, (value, set) => {
        set(new Promise(async (resolve) => {
            let resolved = await value;
            if (resolved.type != PrimitiveValueType.MAP) return;

            resolve(resolved.value);
        }));
    });
}
