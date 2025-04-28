<script lang="ts">
    import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {type FormQuestion, FormQuestionDisplayType} from "@perfice/model/form/form";
    import ValidatedFormField from "@perfice/components/form/fields/ValidatedFormField.svelte";

    let {questions, answers}: { questions: FormQuestion[], answers: Record<string, PrimitiveValue> } = $props();
    let fields: Record<string, ValidatedFormField> = $state({});

    export function validateAndGetAnswers(): Record<string, PrimitiveValue> | null {
        let result: Record<string, PrimitiveValue> = {};
        let failed = false;
        for (let [id, field] of Object.entries(fields)) {
            // If "questions" was updated, the field might be null since it's no longer being rendered
            if (field == null) continue;

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

    export function focus() {
        if (questions.length == 0) return;

        let question = questions[0];
        if (question.displayType != FormQuestionDisplayType.INPUT) return;

        focusField(question.id);
    }

    export function focusField(id: string) {
        let field = fields[id];
        if (field == null) return;

        field.focus();
    }

    function onFieldChanged(_question: FormQuestion) {
    }

    /**
     * Invalidates all fields to use the value passed in "answers".
     */
    export function invalidateValues() {
        Object.values(fields)
            .forEach(f => f.invalidateValue());
    }
</script>

{#each questions as question(question.id)}
    <div class="field">
        <ValidatedFormField bind:this={fields[question.id]} disabled={false}
                            value={answers[question.id] ?? pNull()}
                            onUpdated={() => onFieldChanged(question)}
                            question={$state.snapshot(question)}/>
    </div>
{/each}

<style>
    .field:not(:last-child) {
        @apply mb-4;
    }
</style>
