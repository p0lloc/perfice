import {get, type Subscriber, type Unsubscriber, type Updater, writable, type Writable} from "svelte/store";
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

    setResolved(value: T) {
        this.set(resolvedPromise(value));
    }

    updateResolved(updater: Updater<T>) {
        this.set(resolvedUpdatePromise(this.get(), updater));
    }

}


// type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;
//
// type StoresValues<T> =
//     T extends Readable<infer U> ? U : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };
//
// export function debouncedDerive<S extends Stores, T>(stores: S,
//                                                      fn: (values: StoresValues<S>,
//                                                           set: (value: T) => void, update: (fn: Updater<T>) => void) => Unsubscriber | void,
//                                                      initial_value: T): Readable<T> {
//     let timeout: any = null;
//     let previousValues: T = initial_value;
//     return derived(stores, (values, set, update) => {
//         console.log("prev", previousValues);
//         set(previousValues);
//         clearTimeout(timeout);
//         timeout = setTimeout(() => {
//             fn(values, (v) => {
//                 console.log("set", v);
//                 previousValues = v;
//                 set(v);
//             }, update);
//         }, 500);
//     });
// }
//
