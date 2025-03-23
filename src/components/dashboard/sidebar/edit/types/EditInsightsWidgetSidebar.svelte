<script lang="ts">
    import type {DashboardInsightsWidgetSettings} from "@perfice/model/dashboard/widgets/insights";
    import type {Form} from "@perfice/model/form/form";
    import {SIMPLE_TIME_SCOPE_TYPES} from "@perfice/model/variable/ui";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";

    let {settings, onChange}: {
        settings: DashboardInsightsWidgetSettings,
        onChange: (settings: DashboardInsightsWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();

</script>

<div class="row-between mt-2">
    Time scope
    <BindableDropdownButton value={settings.timeScope}
                            onChange={(v) => onChange({...settings, timeScope: v})}
                            items={SIMPLE_TIME_SCOPE_TYPES}/>
</div>