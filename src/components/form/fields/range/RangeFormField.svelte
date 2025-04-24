<script lang="ts">
    import type {RangeFormQuestionSettings} from "@perfice/model/form/display/range";
    import type {FormFieldProps} from "@perfice/model/form/ui";
    // noinspection ES6UnusedImports
    import RangeSlider from "svelte-range-slider-pips";
    import type {NumberFormQuestionDataSettings} from "@perfice/model/form/data/number";

    let {dataSettings, displaySettings, disabled, value, onChange}: FormFieldProps = $props();

    let data = $derived(dataSettings as NumberFormQuestionDataSettings);
    let display = $derived(displaySettings as RangeFormQuestionSettings);
</script>

<RangeSlider on:change={(e) => onChange(e.detail.value)}
             pips
             springValues={{ stiffness: 1.0, damping: 1.0 }}
             all="label"
             value={value} min={data.min ?? 0} max={data.max ?? 100} step={display.step ?? 1} {disabled}/>