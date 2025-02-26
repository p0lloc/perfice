import { emptyPromise, resolvedPromise } from "@perfice/util/promise";
import { writable, type Writable } from "svelte/store";

const cache = new Map<string, any>();

export function CachedPromiseStore<T>(key: string, valuePromise: Promise<T>, onDestroy: () => void, defaultValue?: T): Writable<Promise<T>> {
    const { subscribe, set, update } = writable<Promise<T>>(emptyPromise(), onDestroy);

    let promise = new Promise<T>(async (resolve) => {
        let cachedValue = cache.get(key);
        if (cachedValue != null) {
            // If a cached value exists, resolve it immediately
            resolve(cachedValue);
        } else if (defaultValue != null) {
            resolve(defaultValue);
        }

        let val = await valuePromise;

        cache.set(key, val);
        if (cachedValue == null && defaultValue == null) {
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
        set,
        update,
    }
}

export function disposeCachedStoreKey(key: string) {
    cache.delete(key);
}
