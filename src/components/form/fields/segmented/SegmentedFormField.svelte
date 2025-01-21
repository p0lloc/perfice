<script lang="ts">
    import type {SegmentedFormQuestionSettings} from "@perfice/model/form/display/segmented";
    import type {FormFieldProps} from "@perfice/model/form/ui";

    let {dataSettings, displaySettings, disabled, value, onChange}: FormFieldProps = $props();

    let display = displaySettings as SegmentedFormQuestionSettings;
</script>
