import {writable} from "svelte/store";

export const drawerOpen = writable(false);

export function closeDrawer() {
    drawerOpen.set(false);
}

export function toggleDrawer() {
    drawerOpen.update(v => !v);
}
