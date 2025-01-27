import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import {fileURLToPath, URL} from "node:url";
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true
            },
            manifest: {
                name: 'Perfice',
                short_name: 'Perfice',
                description: 'Track everything and see how different choices affect your life.',
                theme_color: '#16A34A',
                start_url: "/",
                display: "fullscreen",
                display_override: ["window-controls-overlay"],
                screenshots: [
                    {
                        src: "dashboard.png",
                        sizes: "1700x925",
                        type: "image/png",
                        form_factor: "wide",
                        label: "Perfice app"
                    },

                    {
                        src: "mobile.png",
                        sizes: "1242x2688",
                        type: "image/png",
                        form_factor: "narrow",
                        label: "Perfice mobile view"
                    }
                ],
                icons: [
                    {
                        src: 'favicon-64x64.png',
                        sizes: '64x64',
                        type: 'image/png'
                    },

                    {
                        src: 'favicon-128x128.png',
                        sizes: '128x128',
                        type: 'image/png'
                    },

                    {
                        src: 'favicon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            "@perfice": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
})
