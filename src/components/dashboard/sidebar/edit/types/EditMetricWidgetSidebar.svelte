<script lang="ts">
    import type {DashboardMetricWidgetSettings} from "@perfice/model/dashboard/widgets/metric";
    import type {Form} from "@perfice/model/form/form";
    import {onMount} from "svelte";
    import {variableEditProvider} from "@perfice/app";
    import EditVariable from "@perfice/components/variable/edit/EditVariable.svelte";
    import {SIMPLE_TIME_SCOPE_TYPES} from "@perfice/model/variable/ui";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";

    let {dependencies, settings, onChange}: {
        settings: DashboardMetricWidgetSettings,
        onChange: (settings: DashboardMetricWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();

    let loaded = $state(false);

    onMount(() => {
        variableEditProvider.newEdit(true);
        loaded = true;
    })
</script>

{#if loaded}
    <div class="mt-4">
        <EditVariable useDisplayValues={true} editName={false} variableId={dependencies["variable"]} onEdit={() => {}}/>
    </div>
    <div class="row-between mt-2">
        Time scope
        <BindableDropdownButton value={settings.timeScope}
                                onChange={(v) => onChange({...settings, timeScope: v})}
                                items={SIMPLE_TIME_SCOPE_TYPES}/>
    </div>
{/if}