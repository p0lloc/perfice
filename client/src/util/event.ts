import {type Writable} from "svelte/store";

export function subscribeToEventStore<T>(list: T[], writable: Writable<T[]>, handler: (e: T) => void) {
    if(list.length == 0) return;

    for(let event of list) {
        handler(event);
    }

    writable.set([]);
}

export function publishToEventStore<T>(writable: Writable<T[]>, event: T) {
    writable.update(v => [...v, event]);
}
