import {get, type Subscriber, type Unsubscriber, type Updater, writable, type Writable} from "svelte/store";
import {resolvedPromise, resolvedUpdatePromise} from "@perfice/util/promise";
import type {PreprocessedEntity} from "@perfice/model/sync/sync";
import {applyUpdates} from "@perfice/services/sync/sync";

export class CustomStore<T> implements Writable<T> {
    protected writable: Writable<T>;

    constructor(initial: T) {
        this.writable = writable(initial);
    }

    get(): T {
        return get(this.writable);
    }

    set(value: T): void {
        return this.writable.set(value);
    }

    update(updater: Updater<T>): void {
        return this.writable.update(updater);
    }

    subscribe(run: Subscriber<T>, invalidate?: any): Unsubscriber {
        return this.writable.subscribe(run, invalidate);
    }
}

export class AsyncStore<T> extends CustomStore<Promise<T>> {

    constructor(initial: Promise<T>) {
        super(initial);
    }

    setResolved(value: T) {
        this.set(resolvedPromise(value));
    }

    updateResolved(updater: Updater<T>) {
        this.set(resolvedUpdatePromise(this.get(), updater));
    }

    applySyncUpdates(syncUpdates: PreprocessedEntity[]) {
        this.updateResolved(v => {
            if (!Array.isArray(v)) return v;
            return applyUpdates(v, syncUpdates) as T;
        });
    }

}