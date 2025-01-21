<script lang="ts">
    import type {Component} from "svelte";
    import {FormQuestionDisplayType} from "@perfice/model/form/form";
    import type {FormFieldProps} from "@perfice/model/form/ui";
    import InputFormField from "@perfice/components/form/fields/input/InputFormField.svelte";
    import type {FormQuestionDataSettings} from "@perfice/model/form/data";
    import type {FormQuestionDisplaySettings} from "@perfice/model/form/display";
    import RangeFormField from "@perfice/components/form/fields/range/RangeFormField.svelte";
    import SegmentedFormField from "@perfice/components/form/fields/segmented/SegmentedFormField.svelte";
    import SelectFormField from "@perfice/components/form/fields/select/SelectFormField.svelte";
    import HierarchyFormField from "@perfice/components/form/fields/hierarchy/HierarchyFormField.svelte";

    let {displayType, value, onChange, disabled, dataSettings, displaySettings}: {
        dataSettings: FormQuestionDataSettings,
        displaySettings: FormQuestionDisplaySettings,
        displayType: FormQuestionDisplayType,
        disabled: boolean,
        value: any,
        onChange: (v: any) => void
    } = $props();

    const FIELD_RENDERERS: Record<FormQuestionDisplayType, Component<FormFieldProps>> = {
        [FormQuestionDisplayType.INPUT]: InputFormField,
        [FormQuestionDisplayType.RANGE]: RangeFormField,
        [FormQuestionDisplayType.SEGMENTED]: SegmentedFormField,
        [FormQuestionDisplayType.SELECT]: SelectFormField,
        [FormQuestionDisplayType.HIERARCHY]: HierarchyFormField,
    }

    const RendererComponent = $derived(FIELD_RENDERERS[displayType]);
</script>
<RendererComponent {value} {onChange} {disabled} dataSettings={dataSettings}
                   displaySettings={displaySettings.displaySettings}/>
