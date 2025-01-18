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

export function VariableStore(id: string, timeContext: TimeScope, variableService: VariableService): Readable<Promise<PrimitiveValue>> {
    let context = new VariableFetchContext(variableService);
    const {subscribe, set} = writable<Promise<PrimitiveValue>>(new Promise<PrimitiveValue>(() => {
    }), () => {
        // When this store is destroyed, unregister the listener
        return () => context.unregister()
    });

    let promise = new Promise<PrimitiveValue>(async (resolve) => {
        // When the variable value is updated, update the store
        let onVariableUpdated = (res: PrimitiveValue) => set(resolvedPromise(res));

        let val = await context.evaluateVariableLive(id, timeContext, onVariableUpdated);
        resolve(val);
    });

    set(promise);

    return {
        subscribe,
    }
}
