<script lang="ts">
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import {extractAnswerValuesFromDisplay} from "@perfice/services/variable/types/list";
    import type {
        ReflectionFormWidgetAnswerState,
        ReflectionFormWidgetSettings
    } from "@perfice/model/reflection/widgets/form";
    import {forms} from "@perfice/stores";

    let {settings, state, onChange}: {
        settings: ReflectionFormWidgetSettings,
        state: ReflectionFormWidgetAnswerState,
        onChange: (state: ReflectionFormWidgetAnswerState) => void
    } = $props();

    let embed: FormEmbed;

    export function validate(): boolean {
        let answers = embed.validateAndGetAnswers();
        if (answers == null) return false;

        onChange({
            ...state,
            answers: extractAnswerValuesFromDisplay(answers)
        })

        return true;
    }

    let form = $derived.by(async () => await forms.getFormById(settings.formId));
</script>

{#await form}
    Loading...
{:then value}
    {#if value != null}
        <FormEmbed bind:this={embed} questions={value.questions} answers={state.answers}/>
    {:else}
        Unknown form
    {/if}
{/await}