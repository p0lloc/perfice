<script lang="ts">
    import type {FormQuestion} from "@perfice/model/form/form";
    import {pDisplay, pList, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import FormFieldRenderer from "@perfice/components/form/fields/FormFieldRenderer.svelte";

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

    function deserializeMultiple(multiple: any[]): PrimitiveValue | null {
        let result: PrimitiveValue[] = [];
        for (let v of multiple) {
            let deserialized = dataTypeDef.deserialize(v);
            if (deserialized == null) {
                return null;
            }

            result.push(deserialized);
        }

        return pList(result);
    }

    function validateMultiple(value: PrimitiveValue): string | null {
        if (value.type == PrimitiveValueType.LIST) {
            for (let v of value.value) {
                let error = dataTypeDef.validate(v.value, question.dataSettings);
                if (error != null) return error;
            }
        }

        return null;
    }

    export function validateAndGetValue(): PrimitiveValue | null {
        let value: PrimitiveValue | null;
        let valueSnapshot = $state.snapshot(serializedValue);
        if (displayTypeDef.hasMultiple(question.displaySettings) && Array.isArray(serializedValue)) {
            value = deserializeMultiple(valueSnapshot);
        } else {
            value = dataTypeDef.deserialize(valueSnapshot);
        }

        if (value == null) {
            errorMessage = "Input is incorrectly formatted!";
            return null;
        }

        let dataError;
        if (displayTypeDef.hasMultiple(question.displaySettings)) {
            dataError = validateMultiple(value);
        } else {
            dataError = dataTypeDef.validate(value.value, question.dataSettings);
        }

        if (dataError != null) {
            errorMessage = dataError;
            return null;
        }

        let error = displayTypeDef.validate(value);
        if (error != null) {
            errorMessage = error;
            return null;
        }

        errorMessage = "";

        let displayValue = displayTypeDef.getDisplayValue(value, question.displaySettings, question.dataSettings);
        if (displayValue.type == PrimitiveValueType.STRING && question.unit != null) {
            // Append unit to the display value
            displayValue.value += ` ${question.unit}`;
        }

        return pDisplay(value, displayValue);
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
