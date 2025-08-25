/// <reference types="vite/client" />
import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import {fileURLToPath, URL} from "node:url";
import {VitePWA} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig((v) => {
    let dev = v.command === 'serve';
    let basePath = dev ? '/' : '/new/';
    return {
        test: {
            setupFiles: ['vitest-localstorage-mock'],
            mockReset: false,
        },
        base: basePath,
        plugins: [
            svelte(),
            VitePWA({
                registerType: 'autoUpdate',
                devOptions: {
                    enabled: true
                },
                workbox: {
                    globPatterns: []
                    //globPatterns: ['**/*.{js,css,html,ico,png,svg}']
                },
                manifest: {
                    name: 'Perfice',
                    short_name: 'Perfice',
                    description: 'Track everything and see how different choices affect your life.',
                    theme_color: '#2adb71',
                    start_url: basePath,
                    display: "fullscreen",
                    display_override: ["window-controls-overlay"],
                    screenshots: [
                        {
                            src: "dashboard-onboarding.png",
                            sizes: "1336x874",
                            type: "image/png",
                            form_factor: "wide",
                            label: "Perfice app"
                        },

                        {
                            src: "dashboard-onboarding-mobile.png",
                            sizes: "801x1295",
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
        }
    };
});
