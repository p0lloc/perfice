<script lang="ts">
    import type {FormQuestion} from "@perfice/model/form/form";
    import {
        pDisplay,
        type PrimitiveValue,
        PrimitiveValueType,
        pString
    } from "@perfice/model/primitive/primitive";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import FormFieldRenderer from "@perfice/components/form/fields/FormFieldRenderer.svelte";
    import {parseAndValidateValue} from "@perfice/model/form/validation";

    let {question, disabled, value}: {
        question: FormQuestion,
        disabled: boolean,
        value: PrimitiveValue,
    } = $props();

    let errorMessage = $state("");
    let displayTypeDef = questionDisplayTypeRegistry.getFieldByType(question.displayType)!;
    let dataTypeDef = questionDataTypeRegistry.getDefinition(question.dataType)!;

    function serializeValue(value: PrimitiveValue) {
        if (value.type == PrimitiveValueType.NULL) {
            return dataTypeDef.getDefaultValue(question.dataSettings);
        }

        if (displayTypeDef.hasMultiple(question.displaySettings) && value.type == PrimitiveValueType.LIST) {
            return value.value.map(v => dataTypeDef.serialize(v));
        } else {
            return dataTypeDef.serialize(value);
        }
    }

    let serializedValue: any = $state(serializeValue(value));

    export function validateAndGetValue(): PrimitiveValue | null {
        let [value, error] = parseAndValidateValue($state.snapshot(serializedValue), question, dataTypeDef, displayTypeDef);
        if (error != null) {
            errorMessage = error;
            return null;
        }

        if (value == null)
            return null;

        return value;
    }

    /**
     * Uses the value passed as a prop.
     * Necessary since the component keeps its own state, we need to re-serialize the value when it changes
     */
    export function invalidateValue() {
        serializedValue = serializeValue(value);
    }

    function onRendererUpdateValue(v: any) {
        serializedValue = v;
    }
</script>

<p class="label mb-2">{question.name}</p>
<FormFieldRenderer dataSettings={question} value={serializedValue} {disabled}
                   onChange={onRendererUpdateValue}
                   displayType={question.displayType}
                   displaySettings={question}/>
<p class="text-red-500">{errorMessage}</p>
