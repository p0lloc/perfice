import {goto} from "@mateothegreat/svelte5-router";

export const routingNavigatorState = $state<string[]>([]);

export function getCurrentRoute(state: string[]) {
    return state.length > 0 ? state[state.length - 1] : "/";
}