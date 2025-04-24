<script lang="ts">
    import {pNumber, primitiveAsNumber, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {FormQuestionDataType} from "@perfice/model/form/form";
    import TimeElapsedInputFormField from "@perfice/components/form/fields/input/TimeElapsedInputFormField.svelte";
    import TimeOfDayInputFormField from "@perfice/components/form/fields/input/TimeOfDayInputFormField.svelte";
    import VanillaInputFormField from "@perfice/components/form/fields/input/VanillaInputFormField.svelte";
    // noinspection ES6UnusedImports

    let {value, onChange, dataType = FormQuestionDataType.NUMBER}: {
        value: PrimitiveValue,
        onChange: (v: PrimitiveValue) => void,
        dataType?: FormQuestionDataType
    } = $props();

    let numberValue = $derived(primitiveAsNumber(value));

    function onChangeValue(value: string | number) {
        onChange(pNumber(typeof value == "string" ? parseFloat(value) : value));
    }

    function renderInput(dataType: FormQuestionDataType) {
        switch (dataType) {
            case FormQuestionDataType.NUMBER:
                return VanillaInputFormField;
            case FormQuestionDataType.TIME_ELAPSED:
                return TimeElapsedInputFormField;
            case FormQuestionDataType.TIME_OF_DAY:
                return TimeOfDayInputFormField;
        }
    }

    let RenderComponent = $derived(renderInput(dataType));
</script>


<RenderComponent disabled={false} value={numberValue} onChange={onChangeValue} dataType={dataType}/>