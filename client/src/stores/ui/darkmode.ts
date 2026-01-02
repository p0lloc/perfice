import { writable } from "svelte/store";

const darkModeKey = "darkMode";

export const darkMode = writable(localStorage.getItem(darkModeKey) === "true");

export function setDarkMode(value: boolean) {
    darkMode.set(value);
    localStorage.setItem(darkModeKey, value ? "true" : "false");
}
