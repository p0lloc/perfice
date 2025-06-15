import './app.css'
import {mount} from "svelte";
import App from "@perfice/App.svelte";
import 'es-iterator-helpers/auto';

document.addEventListener("touchend", () => {
    console.log("touchend a")
})
document.addEventListener("touchcancel", () => {
    console.log("touchend c")
})
const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app