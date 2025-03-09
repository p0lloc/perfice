<script lang="ts">
    import {trackableAnalytics, trackables} from "@perfice/main";
    import type {AnalyticsResult} from "@perfice/stores/analytics/analytics";
    import LineChart from "@perfice/components/chart/LineChart.svelte";
    import {AnalyticsChartType} from "@perfice/stores/analytics/trackable";
    import PieChart from "@perfice/components/chart/PieChart.svelte";

    let {result}: { result: AnalyticsResult } = $props();

    let res = $derived(trackableAnalytics(result));

    trackables.load();
</script>

<div class="grid-cols-4 grid gap-4 mt-4">
    {#await $res}
        Loading...
    {:then values}
        {#each values as value(value.trackable.id)}
            <div class="bg-white rounded p-4 border">
                <h2 class="text-xl font-bold text-gray-500">{value.trackable.name}</h2>
                {#if value.chart.type === AnalyticsChartType.LINE}
                    {#if value.chart.values.length < 3}
                        <p>Not enough data to show chart</p>
                    {:else}
                        <div class="h-24">
                            <LineChart
                                    hideLabels={true}
                                    hideGrid={true}
                                    minimal={false}
                                    dataPoints={value.chart.values.map(v => v.value)}
                                    labels={value.chart.values.map((v) => v.timestamp)}/>
                        </div>
                    {/if}
                {/if}

                {#if value.chart.type === AnalyticsChartType.PIE}
                    <div class="h-24">
                        <PieChart
                                hideLabels={true}
                                hideGrid={true}
                                dataPoints={value.chart.values}/>
                    </div>
                {/if}
            </div>
        {/each}
    {/await}
</div>
