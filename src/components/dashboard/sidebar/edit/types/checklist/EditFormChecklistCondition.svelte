<script lang="ts">
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import type {ChecklistFormCondition} from "@perfice/model/dashboard/widgets/checklist";
    import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import type {Form} from "@perfice/model/form/form";
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import {extractValueFromDisplay} from "@perfice/services/variable/types/list";

    let {forms, value, onChange}: {
        forms: Form[],
        value: ChecklistFormCondition,
        onChange: (v: ChecklistFormCondition) => void
    } = $props();

    let embed: FormEmbed;

    function onFormChanged(formId: string) {
        onChange({...value, formId, answers: {}});
    }

    export function finalize() {
        let answers = embed.validateAndGetAnswers();
        if (answers == null) return;

        let extractedValues = Object.fromEntries(
            Object.entries(answers).map(([k, v]) => [k, extractValueFromDisplay(v)]));

        onChange({...value, answers: extractedValues});
    }

    const formDropdownItems = $derived(forms.map(v => {
        return {
            value: v.id,
            name: v.name,
        }
    }));

    const selectedForm = $derived(forms.find(f => f.id == value.formId));
</script>
<div class="row-between">
    <IconLabel icon={faQuestionCircle} title="Form"/>
    <DropdownButton value={value.formId} items={formDropdownItems} onChange={onFormChanged}/>
</div>

{#if selectedForm != null}
    <hr class="my-4">
    <FormEmbed bind:this={embed} questions={selectedForm.questions} answers={value.answers}/>
{/if}