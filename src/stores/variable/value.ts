import type {VariableCallback, VariableService} from "@perfice/services/variable/variable";
import {SimpleTimeScope, type TimeScope, tSimple} from "@perfice/model/variable/time/time";
import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {type Readable} from "svelte/store";
import {resolvedPromise} from "@perfice/util/promise";
import {CachedPromiseStore} from "@perfice/stores/cached";
import {offsetDateByTimeScope} from "@perfice/util/time/simple";

export class VariableFetchContext {
    private variableService: VariableService;
    private listeners: VariableCallback[] = [];

    constructor(variableService: VariableService) {
        this.variableService = variableService;
    }

    /**
     * Evaluates a variable live, i.e. as soon as the value changes, the callback is called.
     * @param variableId Id of the variable to evaluate
     * @param timeScope Time scope to evaluate the variable in
     * @param callback Called when the variable value changes
     * @param deleteNotifications Whether to reevaluate the variable when it indices are deleted, and notify the callback again
     */
    async evaluateVariableLive(variableId: string, timeScope: TimeScope, callback: VariableCallback, deleteNotifications: boolean = true): Promise<PrimitiveValue> {
        this.listeners.push(callback);
        return this.variableService.evaluateVariableLive(variableId, timeScope, callback, deleteNotifications);
    }

    unregister() {
        for (let listener of this.listeners) {
            this.variableService.unregisterListener(listener);
        }
    }
}

export function VariableValueStore(id: string, timeContext: TimeScope, variableService: VariableService, key: string,
                                   deleteNotifications: boolean = true, customDispose: boolean = false, defaultValue?: PrimitiveValue): Readable<Promise<PrimitiveValue>> {

    let context = new VariableFetchContext(variableService);
    const {subscribe, set} = CachedPromiseStore<PrimitiveValue>(key, new Promise<PrimitiveValue>(async (resolve) => {
        // When the variable value is updated, update the store
        let onVariableUpdated = (res: PrimitiveValue) => set(resolvedPromise(res));
        let val = await context.evaluateVariableLive(id, timeContext, onVariableUpdated, deleteNotifications);

        resolve(val);
    }), () => {
        // When this store is destroyed, unregister the listener
        context.unregister()
    }, customDispose, defaultValue);

    return {
        subscribe,
    }
}

export function RangedVariableValueStore(id: string, timeContext: SimpleTimeScope, variableService: VariableService, key: string, count: number,
                                         deleteNotifications: boolean = true): Readable<Promise<PrimitiveValue[]>> {

    let context = new VariableFetchContext(variableService);
    const {
        subscribe,
        set
    } = CachedPromiseStore<PrimitiveValue[]>(key, new Promise<PrimitiveValue[]>(async (resolve) => {
        let vals: PrimitiveValue[] = [];
        for (let i = 0; i < count; i++) {
            let onVariableUpdated = (res: PrimitiveValue) => {
                // Update the corresponding value in the array and update the store
                vals[i] = res;
                set(resolvedPromise(vals));
            };

            // Count backwards from the specified date, for `count` amount of times
            let offsetDate = offsetDateByTimeScope(new Date(timeContext.getTimestamp()), timeContext.getType(), -i);
            let val = await context.evaluateVariableLive(id,
                tSimple(timeContext.getType(), timeContext.getWeekStart(), offsetDate.getTime()), onVariableUpdated,
                deleteNotifications);

            vals.push(val);
        }

        resolve(vals);
    }), () => {
        // When this store is destroyed, unregister the listener
        context.unregister()
    });

    return {
        subscribe,
    }
}
