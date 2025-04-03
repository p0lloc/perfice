<script lang="ts">
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import {getHtmlInputFromQuestionType} from "@perfice/model/form/ui";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";

    let {value, dataType, onChange, class: className = ""}: {
        value: PrimitiveValue,
        dataType: FormQuestionDataType,
        onChange: (v: PrimitiveValue) => void,
        class?: string
    } = $props();

    let dataDef = $derived(questionDataTypeRegistry.getDefinition(dataType));
    let serialized = $derived(dataDef?.serialize(value) ?? "");

    function onInputChange(e: { currentTarget: HTMLInputElement }) {
        let value = e.currentTarget.value;
        if (dataDef == null)
            return;

        let deserialized = dataDef.deserialize(value);
        if (deserialized == null)
            return;

        onChange(deserialized);
    }
</script>

<input class={className} value={serialized} type={getHtmlInputFromQuestionType(dataType)}
       onchange={onInputChange}/>
