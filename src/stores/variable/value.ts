import type {VariableCallback, VariableService} from "@perfice/services/variable/variable";
import type {TimeScope} from "@perfice/model/variable/time/time";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {writable, type Readable} from "svelte/store";
import {resolvedPromise} from "@perfice/util/promise";

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

let cached = new Map<string, PrimitiveValue>();

export function unregisterKey(key: string) {
    cached.delete(key);
}

export function VariableStore(id: string, timeContext: TimeScope, variableService: VariableService, key: string): Readable<Promise<PrimitiveValue>> {
    let context = new VariableFetchContext(variableService);
    const {subscribe, set} = writable<Promise<PrimitiveValue>>(new Promise<PrimitiveValue>(() => {
    }), () => {
        // When this store is destroyed, unregister the listener
        return () => context.unregister()
    });

    let promise = new Promise<PrimitiveValue>(async (resolve) => {
        let cachedValue = cached.get(key);
        if (cachedValue != null) {
            // If a cached value exists, resolve it immediately
            resolve(cachedValue);
        }

        // When the variable value is updated, update the store
        let onVariableUpdated = (res: PrimitiveValue) => set(resolvedPromise(res));
        let val = await context.evaluateVariableLive(id, timeContext, onVariableUpdated);

        cached.set(key, val);
        if(cachedValue == null) {
            // If there was no cached value, resolve with the calculated value
            resolve(val);
        } else {
            // If there was, update the store with the newly calculated value
            set(resolvedPromise(val));
        }
    });

    set(promise);

    return {
        subscribe,
    }
}
