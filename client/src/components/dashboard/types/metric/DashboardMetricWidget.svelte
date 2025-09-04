<script lang="ts">
    import type {DashboardMetricWidgetSettings} from "@perfice/model/dashboard/widgets/metric";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import {metricWidget, weekStart} from "@perfice/stores";

    let {widgetId, dependencies, settings, openFormModal}: {
        settings: DashboardMetricWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void,
        widgetId: string
    } = $props();

    let result = $derived(metricWidget(dependencies, settings, $dashboardDate,
        $weekStart, widgetId));
</script>

<button class="w-full h-full bg-white p-4 flex gap-3 items-center border rounded-xl text-left hover-feedback"
        onclick={() => openFormModal(settings.formId)}>
    {#await $result then value}
        <div>
            <Icon name={value.icon} class="text-green-500 text-3xl w-8"/>
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex justify-between gap-1 items-center w-full">
                <h2 class="text-xl text-gray-600 font-bold overflow-hidden text-ellipsis text-nowrap">{value.name}</h2>
                <p class="text-[10px] text-gray-400 overflow-hidden">{value.timeScope}</p>
            </div>
            <p class="text-lg">{value.value}</p>
        </div>
    {/await}
</button>