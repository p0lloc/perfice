<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faListNumeric} from "@fortawesome/free-solid-svg-icons";
    import type {TextFormQuestionDataSettings} from "@perfice/model/form/data/text";

    let {settings, onChange}: {
        settings: TextFormQuestionDataSettings,
        onChange: (v: TextFormQuestionDataSettings) => void
    } = $props();

    function onMinLengthChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...settings, minLength: parseInt(e.currentTarget.value)});
    }

    function onMaxLengthChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...settings, maxLength: parseInt(e.currentTarget.value)});
    }
</script>

<div class="row-between">
    <div class="row-gap">
        <Fa icon={faListNumeric} class="w-4"/>
        <p>Min length</p>
    </div>

    <input type="number" class="border" value={settings.minLength} onchange={onMinLengthChange}/>
</div>
<div class="row-between mt-2">
    <div class="row-gap">
        <Fa icon={faListNumeric} class="w-4"/>
        <p>Max length</p>
    </div>

    <input type="number" class="border" value={settings.maxLength} onchange={onMaxLengthChange}/>
</div>
