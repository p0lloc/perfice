<script lang="ts">
    import type {RichInputFormQuestionSettings} from "@perfice/model/form/display/rich-input";
    import type {FormFieldProps} from "@perfice/model/form/ui";

    let {dataSettings, displaySettings, disabled, value, onChange}: FormFieldProps = $props();

    let display = displaySettings as RichInputFormQuestionSettings;
</script>
