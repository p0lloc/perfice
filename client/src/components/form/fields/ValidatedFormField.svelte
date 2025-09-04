<script lang="ts">
    import {type FormQuestion} from "@perfice/model/form/form";
    import {type PrimitiveValue, PrimitiveValueType,} from "@perfice/model/primitive/primitive";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import FormFieldRenderer from "@perfice/components/form/fields/FormFieldRenderer.svelte";
    import {parseAndValidateValue} from "@perfice/model/form/validation";

    let {question, disabled, value, onUpdated}: {
        question: FormQuestion,
        disabled: boolean,
        value: PrimitiveValue,
        onUpdated: () => void
    } = $props();

    let errorMessage = $state("");
    let displayTypeDef = questionDisplayTypeRegistry.getFieldByType(question.displayType)!;
    let dataTypeDef = questionDataTypeRegistry.getDefinition(question.dataType)!;

    let renderer: FormFieldRenderer;

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

    export function focus() {
        renderer.focus();
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
        onUpdated();
    }

    let unitFormatted = $derived(question.unit != null ? ` (${question.unit})` : "");
</script>

<p class="label mb-2">{question.name}{unitFormatted}</p>
<FormFieldRenderer dataSettings={question} value={serializedValue} {disabled}
                   onChange={onRendererUpdateValue}
                   displayType={question.displayType}
                   bind:this={renderer}
                   displaySettings={question}
                   unit={question.unit ?? undefined}
/>
<p class="text-red-500">{errorMessage}</p>
