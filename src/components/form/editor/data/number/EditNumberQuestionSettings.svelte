<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faListNumeric} from "@fortawesome/free-solid-svg-icons";
    import type {NumberFormQuestionDataSettings} from "@perfice/model/form/data/number";

    let {settings = $bindable()}: { settings: NumberFormQuestionDataSettings } = $props();
</script>

<div class="row-between">
    <div class="row-gap">
        <Fa icon={faListNumeric} class="w-4"/>
        <p>Min</p>
    </div>

    <input type="number" class="border" bind:value={settings.min}/>
</div>
<div class="row-between mt-2">
    <div class="row-gap">
        <Fa icon={faListNumeric} class="w-4"/>
        <p>Max</p>
    </div>

    <input type="number" class="border" bind:value={settings.max}/>
</div>
