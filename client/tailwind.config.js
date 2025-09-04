import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function({ addVariant, e }) {
      addVariant('pointer-feedback', ['@media (pointer: fine) { &:hover }','@media (pointer: coarse) { &:active }']);
    })
,
  ],
}

