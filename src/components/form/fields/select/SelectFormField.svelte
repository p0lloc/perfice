<script lang="ts">
    import type {SelectFormQuestionSettings} from "@perfice/model/form/display/select";
    import type {FormFieldProps} from "@perfice/model/form/ui";

    let {dataSettings, displaySettings, disabled, value, onChange}: FormFieldProps = $props();

    let display = displaySettings as SelectFormQuestionSettings;
</script>
