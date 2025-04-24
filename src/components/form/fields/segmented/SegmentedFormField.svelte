<script lang="ts">
    import type {SegmentedFormQuestionSettings} from "@perfice/model/form/display/segmented";
    import type {FormFieldProps} from "@perfice/model/form/ui";
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";

    let {displaySettings, value, onChange}: FormFieldProps = $props();

    let display = $derived(displaySettings as SegmentedFormQuestionSettings);
</script>

<SegmentedControl {value}
                  segments={display.options.map(o => {
    return {
        name: o.text,
        value: o.value.value,
    }
})} {onChange}/>
