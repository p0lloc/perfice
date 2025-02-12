<script lang="ts">
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";
    import type {InputFieldProps} from "@perfice/model/form/ui";

    let {value, onChange, disabled}: InputFieldProps = $props();

    const BOOLEAN_SEGMENTS = [
        {name: "True", value: true},
        {name: "False", value: false}
    ];
</script>

<SegmentedControl {disabled} {value} inverted={false} segments={BOOLEAN_SEGMENTS} {onChange}/>
