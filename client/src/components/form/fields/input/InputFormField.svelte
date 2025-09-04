<script lang="ts">
    import type {Component} from "svelte";
    import {FormQuestionDataType} from "@perfice/model/form/form";
    import type {FormFieldProps, InputFieldProps} from "@perfice/model/form/ui";
    import VanillaInputFormField from "@perfice/components/form/fields/input/VanillaInputFormField.svelte";
    import BooleanInputFormField from "@perfice/components/form/fields/input/BooleanInputFormField.svelte";
    import TimeElapsedInputFormField from "@perfice/components/form/fields/input/TimeElapsedInputFormField.svelte";
    import TimeOfDayInputFormField from "@perfice/components/form/fields/input/TimeOfDayInputFormField.svelte";
    import DateInputFormField from "@perfice/components/form/fields/input/DateInputFormField.svelte";
    import DateTimeInputFormField from "@perfice/components/form/fields/input/DateTimeInputFormField.svelte";

    let {disabled, value, onChange, dataType}: FormFieldProps = $props();

    let renderer: any;

    function renderInput(type: FormQuestionDataType): Component<InputFieldProps> {
        switch (type) {
            case FormQuestionDataType.TEXT:
            case FormQuestionDataType.NUMBER:
                return VanillaInputFormField;
            case FormQuestionDataType.BOOLEAN:
                return BooleanInputFormField;
            case FormQuestionDataType.TIME_ELAPSED:
                return TimeElapsedInputFormField;
            case FormQuestionDataType.TIME_OF_DAY:
                return TimeOfDayInputFormField;
            case FormQuestionDataType.DATE_TIME:
                return DateTimeInputFormField;
            case FormQuestionDataType.DATE:
                return DateInputFormField;
            default:
                return VanillaInputFormField;
        }
    }

    export function focus() {
        renderer.focus?.();
    }

    let RenderComponent = $derived(renderInput(dataType));
</script>

<RenderComponent bind:this={renderer} {disabled} {value} {onChange} dataType={dataType}/>
