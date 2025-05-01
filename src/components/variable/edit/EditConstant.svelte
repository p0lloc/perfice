<script lang="ts">
    import {pNumber, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {FormQuestionDataType} from "@perfice/model/form/form";
    import TimeElapsedInputFormField from "@perfice/components/form/fields/input/TimeElapsedInputFormField.svelte";
    import TimeOfDayInputFormField from "@perfice/components/form/fields/input/TimeOfDayInputFormField.svelte";
    import VanillaInputFormField from "@perfice/components/form/fields/input/VanillaInputFormField.svelte";
    import BooleanInputFormField from "@perfice/components/form/fields/input/BooleanInputFormField.svelte";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    // noinspection ES6UnusedImports

    let {value, onChange, dataType = FormQuestionDataType.NUMBER}: {
        value: PrimitiveValue,
        onChange: (v: PrimitiveValue) => void,
        dataType?: FormQuestionDataType
    } = $props();

    let dataDef = $derived(questionDataTypeRegistry.getDefinition(dataType)!);
    let numberValue = $derived(dataDef.serialize(value));

    function onChangeValue(value: string | number) {
        onChange(dataDef.deserialize(value) ?? pNumber(0));
    }

    function renderInput(dataType: FormQuestionDataType) {
        switch (dataType) {
            case FormQuestionDataType.TIME_ELAPSED:
                return TimeElapsedInputFormField;
            case FormQuestionDataType.TIME_OF_DAY:
                return TimeOfDayInputFormField;
            case FormQuestionDataType.BOOLEAN:
                return BooleanInputFormField;
            default:
                return VanillaInputFormField;
        }
    }

    let RenderComponent = $derived(renderInput(dataType));
</script>


<RenderComponent disabled={false} value={numberValue} onChange={onChangeValue} dataType={dataType}/>