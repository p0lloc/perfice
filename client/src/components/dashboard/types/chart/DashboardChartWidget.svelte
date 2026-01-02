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
<button class="card basic w-full h-full items-start flex flex-col"
        onclick={onClick}>
    {#await $result}
        <span class="p-2">
            Please select a form
        </span>
    {:then value}
        {#if value.empty}
            <span class="absolute flex z-[5] w-full h-full items-center justify-center text-white">
                No data yet
            </span>
            <span class="absolute w-full h-full text-white rounded-xl z-[4] p-2"
                  style="background: rgba(55,55,55,0.3);">
            </span>
        {/if}
        <div class="p-2 w-full h-full">
            <SingleChart type={value.chartType} fillColor={value.fillColor} borderColor={value.borderColor}
                         hideGrid={false}
                         hideLabels={false}
                         dataPoints={value.dataPoints}
                         minimal={false}
                         randomColor={settings.groupBy != null}
                         title={settings.title}
                         dataSetLabel={value.name}
                         blur={value.empty}
                         labelFormatter={value.labelFormatter}
                         labels={value.labels}/>
        </div>
    {/await}
</button>
