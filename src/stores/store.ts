import {get, writable, type Subscriber, type Unsubscriber, type Updater, type Writable} from "svelte/store";
import {resolvedPromise, resolvedUpdatePromise} from "@perfice/util/promise";

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

    setResolved(value: T){
        this.set(resolvedPromise(value));
    }

    updateResolved(updater: Updater<T>){
        this.set(resolvedUpdatePromise(this.get(), updater));
    }

}
