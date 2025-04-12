<script lang="ts">
    import type {DashboardMetricWidgetSettings} from "@perfice/model/dashboard/widgets/metric";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import {metricWidget, weekStart} from "@perfice/app";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";

    let {widgetId, dependencies, settings}: {
        settings: DashboardMetricWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void,
        widgetId: string
    } = $props();

    let result = $derived(metricWidget(dependencies, settings, $dashboardDate,
        $weekStart, widgetId));
</script>

<div class="w-full h-full bg-white p-4 flex gap-3 items-center border rounded-xl">
    {#await $result then value}
        <div>
            <Icon name={value.icon} class="text-3xl w-8"/>
        </div>
        <div class="flex-1 min-w-0">
            <div class="row-between w-full">
                <h2 class="text-xl text-gray-600 font-bold overflow-hidden text-ellipsis">{value.name}</h2>
                <p class="text-xs text-gray-400 overflow-hidden">{value.timeScope}</p>
            </div>
            <p class="text-lg">{value.value}</p>
        </div>
    {/await}
</div>