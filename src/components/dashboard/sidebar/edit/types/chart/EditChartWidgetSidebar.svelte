<script lang="ts">
    import {
        DASHBOARD_CHART_WIDGET_TYPES,
        type DashboardChartWidgetSettings
    } from "@perfice/model/dashboard/widgets/chart";
    import type {Form} from "@perfice/model/form/form";
    import SelectFormAndQuestion from "@perfice/components/dashboard/sidebar/edit/SelectFormAndQuestion.svelte";
    import ColorPickerButton from "@perfice/components/base/color/ColorPickerButton.svelte";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {SIMPLE_TIME_SCOPE_TYPES} from "@perfice/model/variable/ui";

    let {settings, onChange, forms}: {
        settings: DashboardChartWidgetSettings,
        onChange: (settings: DashboardChartWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();
</script>

<SelectFormAndQuestion onChange={(v) => onChange({...settings, formId: v.formId, questionId: v.questionId})}
                       settings={settings} forms={forms}/>

<div class="row-between mt-2">
    Type
    <BindableDropdownButton value={settings.type}
                            onChange={(v) => onChange({...settings, type: v})}
                            items={DASHBOARD_CHART_WIDGET_TYPES}/>
</div>
<div class="row-between mt-2">
    Time scope
    <BindableDropdownButton value={settings.timeScope}
                            onChange={(v) => onChange({...settings, timeScope: v})}
                            items={SIMPLE_TIME_SCOPE_TYPES}/>
</div>
<div class="row-between mt-2">
    Count
    <input type="number" value={settings.count} class="w-16 p-2"
           onchange={(e) => onChange({...settings, count: parseInt(e.currentTarget.value) ?? 0})}>
</div>
<div class="row-between mt-2">
    Color
    <ColorPickerButton value={settings.color} onChange={(v) => onChange({...settings, color: v})}/>
</div>
