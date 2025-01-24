import type {VariableCallback, VariableService} from "@perfice/services/variable/variable";
import {SimpleTimeScope, tSimple, type TimeScope} from "@perfice/model/variable/time/time";
import {pNumber, type PrimitiveValue} from "@perfice/model/primitive/primitive";
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

    async evaluateVariableLive(variableId: string, timeScope: TimeScope, callback: VariableCallback): Promise<PrimitiveValue> {
        this.listeners.push(callback);
        return this.variableService.evaluateVariableLive(variableId, timeScope, callback);
    }

    unregister() {
        for (let listener of this.listeners) {
            this.variableService.unregisterListener(listener);
        }
    }
}

export function VariableValueStore(id: string, timeContext: TimeScope, variableService: VariableService, key: string): Readable<Promise<PrimitiveValue>> {
    let context = new VariableFetchContext(variableService);
    const {subscribe, set} = CachedPromiseStore<PrimitiveValue>(key, new Promise<PrimitiveValue>(async (resolve) => {
        // When the variable value is updated, update the store
        let onVariableUpdated = (res: PrimitiveValue) => set(resolvedPromise(res));
        let val = await context.evaluateVariableLive(id, timeContext, onVariableUpdated);

        resolve(val);
    }), () => {
        // When this store is destroyed, unregister the listener
        return () => context.unregister()
    }, pNumber(0.0));

    return {
        subscribe,
    }
}

export function RangedVariableValueStore(id: string, timeContext: SimpleTimeScope, variableService: VariableService, key: string, count: number): Readable<Promise<PrimitiveValue[]>> {
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
                tSimple(timeContext.getType(), timeContext.getWeekStart(), offsetDate.getTime()), onVariableUpdated);

            vals.push(val);
        }

        resolve(vals);
    }), () => {
        // When this store is destroyed, unregister the listener
        return () => context.unregister()
    });

    return {
        subscribe,
    }
}
