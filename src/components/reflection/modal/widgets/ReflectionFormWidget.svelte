<script lang="ts">
    import type {
        ReflectionFormWidgetAnswerState
    } from "@perfice/model/reflection/reflection";
    import {forms} from "@perfice/app";
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import {extractValueFromDisplay} from "@perfice/services/variable/types/list";
    import type {ReflectionFormWidgetSettings} from "@perfice/model/reflection/widgets/form";

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
            answers: Object.fromEntries(
                Object.entries(answers).map(([k, v]) => [k, extractValueFromDisplay(v)]))
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