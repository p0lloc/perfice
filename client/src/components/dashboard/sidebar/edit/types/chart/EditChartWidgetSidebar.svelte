<script lang="ts">
    import {
        DASHBOARD_CHART_WIDGET_TYPES,
        type DashboardChartWidgetSettings,
        DashboardChartWidgetType
    } from "@perfice/model/dashboard/widgets/chart";
    import type {Form} from "@perfice/model/form/form";
    import ColorPickerButton from "@perfice/components/base/color/ColorPickerButton.svelte";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {AGGREGATE_TYPES, SIMPLE_TIME_SCOPE_TYPES} from "@perfice/model/variable/ui";
    import type {AggregateType} from "@perfice/services/variable/types/aggregate";
    import Button from "@perfice/components/base/button/Button.svelte";

    let {settings, onChange, forms}: {
        settings: DashboardChartWidgetSettings,
        onChange: (settings: DashboardChartWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();

    let selectedForm = $derived<Form | undefined>(forms.find(f => f.id == settings.formId));
    let availableForms = $derived(forms.map(v => {
        return {value: v.id, name: v.name}
    }));

    let availableQuestions = $derived(selectedForm?.questions.map(v => {
        return {value: v.id, name: v.name}
    }) ?? []);

    function onFormChange(formId: string) {
        let form = forms.find(f => f.id == formId);
        if (form == null) return;

        onChange({
            ...settings,
            formId,
            questionId: form.questions.length > 0 ? form.questions[0].id : ""
        });
    }

    function onAggregateTypeChange(type: AggregateType) {
        onChange({
            ...settings,
            aggregateType: type
        });
    }

    function onTypeChange(type: DashboardChartWidgetType) {
        onChange({
            ...settings,
            type,
            groupBy: type == DashboardChartWidgetType.PIE ? selectedForm?.questions[0]?.id ?? "" : settings.groupBy
        });
    }

    function onQuestionChange(questionId: string) {
        onChange({...settings, questionId});
    }

    function addTitle() {
        onChange({...settings, title: ""});
    }
</script>

<div class="row-between">
    Form
    <BindableDropdownButton value={settings.formId} items={availableForms}
                            onChange={onFormChange}/>
</div>
<div class="row-between mt-2">
    Question
    <BindableDropdownButton value={settings.questionId} items={availableQuestions}
                            onChange={onQuestionChange}/>
</div>
<div class="row-between mt-2">
    Type
    <BindableDropdownButton value={settings.type}
                            onChange={onTypeChange}
                            items={DASHBOARD_CHART_WIDGET_TYPES}/>
</div>
<div class="row-between mt-2">
    Aggregation
    <BindableDropdownButton value={settings.aggregateType}
                            onChange={onAggregateTypeChange}
                            items={AGGREGATE_TYPES}/>
</div>

<div class="row-between mt-2">
    Group by
    <BindableDropdownButton value={settings.groupBy}
                            onChange={(v) => onChange({...settings, groupBy: v})}
                            items={[{value: null, name: "None"}, ...availableQuestions]}/>
</div>

{#if settings.groupBy == null}
    <div class="row-between mt-2">
        Count
        <input type="number" value={settings.count} class="w-16 p-2"
               onchange={(e) => onChange({...settings, count: parseInt(e.currentTarget.value) ?? 0})}>
    </div>
{/if}

<div class="row-between mt-2">
    Time scope
    <BindableDropdownButton value={settings.timeScope}
                            onChange={(v) => onChange({...settings, timeScope: v})}
                            items={SIMPLE_TIME_SCOPE_TYPES}/>
</div>


{#if settings.groupBy == null}
    <div class="row-between mt-2">
        Color
        <ColorPickerButton value={settings.color} onChange={(v) => onChange({...settings, color: v})}/>
    </div>
{/if}
<div class="row-between mt-2">
    Title
    {#if settings.title != null}
        <input type="text" value={settings.title}
               onchange={(e) => onChange({...settings, title: e.currentTarget.value})}/>
    {:else}
        <Button onClick={addTitle}>Add</Button>
    {/if}
</div>
