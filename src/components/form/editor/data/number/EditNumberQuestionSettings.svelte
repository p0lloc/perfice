<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faListNumeric} from "@fortawesome/free-solid-svg-icons";
    import type {NumberFormQuestionDataSettings} from "@perfice/model/form/data/number";

    let {settings, onChange}: {
        settings: NumberFormQuestionDataSettings,
        onChange: (v: NumberFormQuestionDataSettings) => void
    } = $props();

    function onMinChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...settings, min: parseFloat(e.currentTarget.value)});
    }

    function onMaxChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...settings, max: parseFloat(e.currentTarget.value)});
    }
</script>

<div class="row-between">
    <div class="row-gap">
        <Fa icon={faListNumeric} class="w-4"/>
        <p>Min</p>
    </div>

    <input type="number" class="border" value={settings.min} onchange={onMinChange}/>
</div>
<div class="row-between mt-2">
    <div class="row-gap">
        <Fa icon={faListNumeric} class="w-4"/>
        <p>Max</p>
    </div>

    <input type="number" class="border" value={settings.max} onchange={onMaxChange}/>
</div>
