<script lang="ts">
    import type {Component} from "svelte";
    import {FormQuestionDataType} from "@perfice/model/form/form";
    import type {FormFieldProps, InputFieldProps} from "@perfice/model/form/ui";
    import VanillaInputFormField from "@perfice/components/form/fields/input/VanillaInputFormField.svelte";
    import BooleanInputFormField from "@perfice/components/form/fields/input/BooleanInputFormField.svelte";
    import TimeElapsedInputFormField from "@perfice/components/form/fields/input/TimeElapsedInputFormField.svelte";

    let {dataSettings, disabled, value, onChange}: FormFieldProps = $props();

    function renderInput(type: FormQuestionDataType): Component<InputFieldProps> {
        switch (type) {
            case FormQuestionDataType.TEXT:
            case FormQuestionDataType.NUMBER:
            case FormQuestionDataType.DATE:
            case FormQuestionDataType.DATE_TIME:
                return VanillaInputFormField;
            case FormQuestionDataType.BOOLEAN:
                return BooleanInputFormField;
            case FormQuestionDataType.TIME_ELAPSED:
                return TimeElapsedInputFormField;
            default:
                return VanillaInputFormField;
        }
    }

    let RenderComponent = $derived(renderInput(dataSettings.dataType));
</script>

<RenderComponent {disabled} {value} {onChange} dataType={dataSettings.dataType}/>
