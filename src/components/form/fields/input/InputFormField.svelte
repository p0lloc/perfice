<script lang="ts">
    import type {Component} from "svelte";
    import {FormQuestionDataType} from "@perfice/model/form/form";
    import type {FormFieldProps, InputFieldProps} from "@perfice/model/form/ui";
    import VanillaInputFormField from "@perfice/components/form/fields/input/VanillaInputFormField.svelte";

    let {dataSettings, disabled, value, onChange}: FormFieldProps = $props();

    function renderInput(type: FormQuestionDataType): Component<InputFieldProps> {
        switch (type) {
            case FormQuestionDataType.TEXT:
            case FormQuestionDataType.NUMBER:
            case FormQuestionDataType.DATE:
            case FormQuestionDataType.DATE_TIME:
                return VanillaInputFormField;
            default:
                return VanillaInputFormField;
        }
    }

    let RenderComponent = $derived(renderInput(dataSettings.dataType));
</script>

<RenderComponent {disabled} {value} {onChange} dataType={dataSettings.dataType}/>
