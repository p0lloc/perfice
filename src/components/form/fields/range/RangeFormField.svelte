<script lang="ts">
    import type {RangeFormQuestionSettings} from "@perfice/model/form/display/range";
    import type {FormFieldProps} from "@perfice/model/form/ui";

    let {dataSettings, displaySettings, disabled, value, onChange}: FormFieldProps = $props();

    let display = displaySettings as RangeFormQuestionSettings;
</script>
