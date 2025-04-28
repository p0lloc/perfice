<script lang="ts">
    import type {DashboardChartWidgetSettings} from "@perfice/model/dashboard/widgets/chart";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import SingleChart from "@perfice/components/chart/SingleChart.svelte";
    import {chartWidget, weekStart} from "@perfice/stores";
    import {Capacitor} from "@capacitor/core";

    let {settings, dependencies, openFormModal}: {
        settings: DashboardChartWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    let result = $derived(chartWidget(dependencies, settings, $dashboardDate,
        $weekStart, `${settings.formId}:${settings.questionId}:${settings.aggregateType}:${settings.count}`));

    function onClick() {
        // On mobile we need to support hovering as click (such as when clicking on different data points)
        if (Capacitor.isNativePlatform())
            return;

        openFormModal(settings.formId);
    }
</script>
<button class="bg-white rounded-xl border basic w-full h-full items-start flex flex-col p-2"
        onclick={onClick}>
    {#await $result}
        <span class="p-2">
            Please select a form
        </span>
    {:then value}
        <SingleChart type={value.chartType} fillColor={value.fillColor} borderColor={value.borderColor} hideGrid={false}
                     hideLabels={false}
                     dataPoints={value.dataPoints}
                     minimal={false}
                     randomColor={settings.groupBy != null}
                     title={settings.title}
                     dataSetLabel={value.name}
                     labelFormatter={value.labelFormatter}
                     labels={value.labels}/>
    {/await}
</button>
