<script lang="ts">
    import type {HierarchyFormQuestionSettings} from "@perfice/model/form/display/hierarchy";
    import type {FormFieldProps} from "@perfice/model/form/ui";

    let {dataSettings, displaySettings, disabled, value, onChange}: FormFieldProps = $props();

    let display = displaySettings as HierarchyFormQuestionSettings;
</script>
