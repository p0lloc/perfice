<script lang="ts">

    import EditSelectedField from "@perfice/components/integration/EditSelectedField.svelte";
    import type {SelectedField} from "@perfice/model/integration/ui";
    import type {Form} from "@perfice/model/form/form";
    import type {IntegrationEntityDefinition} from "@perfice/model/integration/integration";

    let {form, selectedEntity, fields}: {
        selectedEntity: IntegrationEntityDefinition,
        form: Form,
        fields?: Record<string, string>
    } = $props();

    function constructFields(fields?: Record<string, string>) {
        let questionIdToFields = fields != null ?
            Object.fromEntries(Object.entries(fields).map(([k, v]) => [v, k])) : {};

        // Always make sure all form questions are displayed, but optionally fill in integration fields
        return form.questions.map(q => ({
            integrationField: questionIdToFields[q.id] ?? null,
            questionId: q.id
        }))
    }

    let selectedFields = $state<SelectedField[]>(constructFields(fields));

    let fieldItems = $derived(selectedEntity != null ?
        [
            {value: null, name: "(Empty)"},
            ...
                Object.entries(selectedEntity!.fields).map(([k, v]) => ({
                    value: k,
                    name: v
                }))] : []);

    let questionItems = $derived(form?.questions.map(q => ({
        value: q.id,
        name: q.name
    })) ?? []);

    export function save() {
        return Object.fromEntries(selectedFields
            .filter(f => f.integrationField != null)
            .map(f => [f.integrationField, f.questionId]));
    }

    function onSelectedFieldChange(selectedField: SelectedField, index: number) {
        selectedFields[index] = selectedField;
    }
</script>

<div class="flex flex-col md:gap-2 gap-8 mt-8">
    {#each selectedFields as selectedField, i}
        <EditSelectedField {selectedField} fields={fieldItems} {questionItems}
                           onChange={(update) => onSelectedFieldChange(update, i)}/>
    {/each}
</div>
