<script lang="ts">
    import type {DashboardChartWidgetSettings} from "@perfice/model/dashboard/widgets/chart";
    import {chartWidget, weekStart} from "@perfice/app";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import SingleChart from "@perfice/components/chart/SingleChart.svelte";

    let {settings, dependencies}: {
        settings: DashboardChartWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    let result = $derived(chartWidget(dependencies, settings, $dashboardDate,
        $weekStart, `${settings.formId}:${settings.questionId}:${settings.aggregateType}:${settings.count}`));
</script>
<div class="bg-white rounded-xl border basic w-full h-full items-start flex flex-col p-2">
    {#await $result}
        <span class="p-2">
            Please select a form
        </span>
    {:then value}
        <SingleChart type={value.chartType} fillColor={value.fillColor} borderColor={value.borderColor} hideGrid={false}
                     hideLabels={false}
                     dataPoints={value.dataPoints}
                     minimal={false}
                     dataSetLabel={value.name}
                     labelFormatter={value.labelFormatter}
                     labels={value.labels}/>
    {/await}
</div>
