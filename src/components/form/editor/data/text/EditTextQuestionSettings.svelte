<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faListNumeric} from "@fortawesome/free-solid-svg-icons";
    import type {TextFormQuestionDataSettings} from "@perfice/model/form/data/text";

    let {settings = $bindable()}: { settings: TextFormQuestionDataSettings } = $props();
</script>

<div class="row-between">
    <div class="row-gap">
        <Fa icon={faListNumeric} class="w-4"/>
        <p>Min length</p>
    </div>

    <input type="number" class="border" bind:value={settings.minLength}/>
</div>
<div class="row-between mt-2">
    <div class="row-gap">
        <Fa icon={faListNumeric} class="w-4"/>
        <p>Max length</p>
    </div>

    <input type="number" class="border" bind:value={settings.maxLength}/>
</div>
