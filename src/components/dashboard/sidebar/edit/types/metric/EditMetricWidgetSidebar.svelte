<script lang="ts">
    import type {DashboardMetricWidgetSettings} from "@perfice/model/dashboard/widgets/metric";
    import {type Form, isFormQuestionNumberRepresentable} from "@perfice/model/form/form";
    import {onMount} from "svelte";
    import {AGGREGATE_TYPES, SIMPLE_TIME_SCOPE_TYPES} from "@perfice/model/variable/ui";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import EditListFilters from "@perfice/components/variable/edit/aggregation/EditListFilters.svelte";
    import type {AggregateType} from "@perfice/services/variable/types/aggregate";
    import {variableEditProvider} from "@perfice/stores";

    let {settings, onChange, forms}: {
        settings: DashboardMetricWidgetSettings,
        onChange: (settings: DashboardMetricWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();

    let loaded = $state(false);

    let selectedForm = $derived<Form | undefined>(forms.find(f => f.id == settings.formId));
    let availableForms = $derived(forms.map(v => {
        return {value: v.id, name: v.name}
    }));

    let availableQuestions = $derived(selectedForm?.questions
        ?.filter(q => isFormQuestionNumberRepresentable(q.dataType))
        .map(v => {
            return {value: v.id, name: v.name}
        }) ?? []
    );

    function onFormChange(formId: string) {
        let form = forms.find(f => f.id == formId);
        if (form == null) return;

        onChange({
            ...settings,
            formId,
            field: form.questions.length > 0 ? form.questions[0].id : ""
        });
    }

    function onFieldChange(field: string) {
        onChange({...settings, field});
    }

    function onAggregateTypeChange(type: AggregateType) {
        onChange({...settings, aggregateType: type});
    }

    onMount(() => {
        variableEditProvider.newEdit(true);
        loaded = true;
    })
</script>

{#if loaded}
    <div class="mt-4">
        <div class="row-between">
            Type
            <BindableDropdownButton value={settings.aggregateType} items={AGGREGATE_TYPES}
                                    onChange={onAggregateTypeChange}/>
        </div>
        <div class="row-between mt-2">
            Form
            <BindableDropdownButton value={settings.formId} items={availableForms}
                                    onChange={onFormChange}/>
        </div>
        <div class="row-between mt-2">
            Question
            <BindableDropdownButton value={settings.field} items={availableQuestions}
                                    onChange={onFieldChange}/>
        </div>
        {#if selectedForm != null}
            <EditListFilters fields={selectedForm.questions} filters={settings.filters}
                             onChange={(v) => onChange({...settings, filters: v})}/>
        {/if}
    </div>
    <div class="row-between mt-2">
        Time scope
        <BindableDropdownButton value={settings.timeScope}
                                onChange={(v) => onChange({...settings, timeScope: v})}
                                items={SIMPLE_TIME_SCOPE_TYPES}/>
    </div>
{/if}