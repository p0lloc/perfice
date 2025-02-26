import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, type Readable} from "svelte/store";
import {pList, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {VariableValueStore} from "@perfice/stores/variable/value";
import type {Tag} from "@perfice/model/tag/tag";

/**
 * Returns the id of the first tag entry that is logged for the given tag on the given date.
 */
export function TagValueStore(tag: Tag,
                              date: Date, weekStart: WeekStart, key: string, variableService: VariableService): Readable<Promise<string | null>> {

    let store: Readable<Promise<PrimitiveValue>> = VariableValueStore(tag.variableId,
        tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key, pList([]));

    return derived(store, (values, set) => {
        set(new Promise(async (resolve) => {
            let resolved = await values;
            if(resolved.type != PrimitiveValueType.LIST) return;

            if(resolved.value.length == 0){
                resolve(null);
                return;
            }

            let entry = resolved.value[0];
            if(entry.type != PrimitiveValueType.TAG_ENTRY) return;

            resolve(entry.value.id);
        }));
    });
}
