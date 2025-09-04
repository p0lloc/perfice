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
    import RichInputFormField from "@perfice/components/form/fields/richInput/RichInputFormField.svelte";
    import TextAreaFormField from "@perfice/components/form/fields/textArea/TextAreaFormField.svelte";

    let {displayType, value, onChange, disabled, dataSettings, displaySettings, unit}: {
        dataSettings: FormQuestionDataSettings,
        displaySettings: FormQuestionDisplaySettings,
        displayType: FormQuestionDisplayType,
        disabled: boolean,
        value: any,
        onChange: (v: any) => void,
        unit?: string
    } = $props();

    let renderer: any;

    export function focus() {
        renderer.focus?.();
    }

    const FIELD_RENDERERS: Record<FormQuestionDisplayType, Component<FormFieldProps>> = {
        [FormQuestionDisplayType.INPUT]: InputFormField,
        [FormQuestionDisplayType.TEXT_AREA]: TextAreaFormField,
        [FormQuestionDisplayType.RANGE]: RangeFormField,
        [FormQuestionDisplayType.SEGMENTED]: SegmentedFormField,
        [FormQuestionDisplayType.SELECT]: SelectFormField,
        [FormQuestionDisplayType.HIERARCHY]: HierarchyFormField,
        [FormQuestionDisplayType.RICH_INPUT]: RichInputFormField,
    }

    const RendererComponent = $derived(FIELD_RENDERERS[displayType]);
</script>
<RendererComponent {value} {onChange} {disabled} dataSettings={dataSettings.dataSettings}
                   {unit}
                   bind:this={renderer}
                   displaySettings={displaySettings.displaySettings} dataType={dataSettings.dataType}/>
