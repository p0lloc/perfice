import {goto} from "@mateothegreat/svelte5-router";
import {get, writable} from "svelte/store";

export const routingNavigatorState = writable<string[]>([]);

export function getCurrentRoute(state: string[]) {
    return state.length > 0 ? state[state.length - 1] : "/";
}

export function jumpToRoute(route: string) {
    routingNavigatorState.set([]);
    goto(route);
}
