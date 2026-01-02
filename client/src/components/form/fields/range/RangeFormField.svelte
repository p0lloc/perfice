<script lang="ts">
    import type {RangeFormQuestionSettings} from "@perfice/model/form/display/range";
    import type {FormFieldProps} from "@perfice/model/form/ui";
    // noinspection ES6UnusedImports
    import RangeSlider from "svelte-range-slider-pips";
    import type {NumberFormQuestionDataSettings} from "@perfice/model/form/data/number";
    import { darkMode } from "@perfice/stores/ui/darkmode";

    let {dataSettings, displaySettings, disabled, value, onChange}: FormFieldProps = $props();

    let data = $derived(dataSettings as NumberFormQuestionDataSettings);
    let display = $derived(displaySettings as RangeFormQuestionSettings);

    function onStop(e: { detail: { value: number } }) {
        onChange(e.detail.value);
    }
</script>

<RangeSlider
        on:stop={onStop}
        pips
        darkmode={$darkMode ? "force" : false}
        springValues={{ stiffness: 1.0, damping: 1.0 }}
        all="label"
        bind:value={value} min={data.min ?? 0} max={data.max ?? 100} step={display.step ?? 1} {disabled}/>