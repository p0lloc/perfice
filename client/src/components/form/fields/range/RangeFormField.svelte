<script lang="ts">
    import {
        DEFAULT_RANGE_MAX_VALUE,
        DEFAULT_RANGE_MIN_VALUE,
        DEFAULT_RANGE_STEP,
        type RangeFormQuestionSettings
    } from "@perfice/model/form/display/range";
    import type {FormFieldProps} from "@perfice/model/form/ui";
    // noinspection ES6UnusedImports
    import RangeSlider from "svelte-range-slider-pips";
    import type {NumberFormQuestionDataSettings} from "@perfice/model/form/data/number";
    import {darkMode} from "@perfice/stores/ui/darkmode";
    import type {RangeLabel} from "@perfice/model/form/display/range.ts";

    let {dataSettings, displaySettings, disabled, value, onChange}: FormFieldProps = $props();

    let data = $derived(dataSettings as NumberFormQuestionDataSettings);
    let display = $derived(displaySettings as RangeFormQuestionSettings);

    function onStop(e: { detail: { value: number } }) {
        onChange(e.detail.value);
    }

    function formatter(labels: RangeLabel[] | null) {
        return (value: number, index?: number) => {
            if (labels == null || index == null || index >= labels.length) return value;

            return labels[index].text;
        };
    }

    let format = $derived(formatter(display.labels))
</script>


<RangeSlider
        on:stop={onStop}
        pips
        darkmode={$darkMode ? "force" : false}
        springValues={{ stiffness: 1.0, damping: 1.0 }}
        formatter={format}
        all="label"
        bind:value={value} min={data.min ?? DEFAULT_RANGE_MIN_VALUE}
        max={data.max ?? DEFAULT_RANGE_MAX_VALUE} step={display.step ?? DEFAULT_RANGE_STEP} {disabled}/>