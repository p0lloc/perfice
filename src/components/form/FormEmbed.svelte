<script lang="ts">
    import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {FormQuestion} from "@perfice/model/form/form";
    import FormField from "@perfice/components/form/fields/ValidatedFormField.svelte";

    let {questions, answers}: { questions: FormQuestion[], answers: Record<string, PrimitiveValue> } = $props();
    let fields: Record<string, FormField> = $state({});

    export function validateAndGetAnswers(): Record<string, PrimitiveValue> | null {
        let result: Record<string, PrimitiveValue> = {};
        let failed = false;
        for (let [id, field] of Object.entries(fields)) {
            let value = field.validateAndGetValue();
            if (value == null) {
                failed = true;
            } else {
                result[id] = value;
            }
        }

        if (failed)
            return null;

        return result;
    }

    /**
     * Invalidates all fields to use the value passed in "answers".
     */
    export function invalidateValues(){
        Object.values(fields)
            .forEach(f => f.invalidateValue());
    }
</script>

{#each questions as question(question.id)}
    <div class="field">
        <FormField bind:this={fields[question.id]} disabled={false}
                   value={answers[question.id] ?? pNull()}
                   question={$state.snapshot(question)}/>
    </div>
{/each}

<style>
    .field:not(:last-child) {
        @apply mb-4;
    }
</style>
