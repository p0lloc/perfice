import './app.css'
import {mount} from "svelte";
import App from "@perfice/App.svelte";
import 'es-iterator-helpers/auto';

const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app