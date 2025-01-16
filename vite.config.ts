import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import {fileURLToPath, URL} from "node:url";

// https://vite.dev/config/
export default defineConfig({
    plugins: [svelte()],
    resolve: {
        alias: {
            "@perfice": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
})
