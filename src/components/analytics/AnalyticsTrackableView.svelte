<script lang="ts">
    import {trackableAnalytics, trackables} from "@perfice/main";
    import LineChart from "@perfice/components/chart/LineChart.svelte";
    import {AnalyticsChartType} from "@perfice/stores/analytics/trackable";
    import PieChart from "@perfice/components/chart/PieChart.svelte";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";

    let res = $derived(trackableAnalytics());

    trackables.load();

    function generateLink(trackable: Trackable): string {
        return `/analytics/trackable:${trackable.id}`;
    }
</script>

<div class="md:grid-cols-4 grid gap-4 mt-4">
    {#await $res}
        Loading...
    {:then values}
        {#each values as value(value.trackable.id)}
            <div class="bg-white rounded p-4 border">
                <div class="flex justify-between items-center mb-2">
                    <p><a href={generateLink(value.trackable)}
                          class="text-xl font-bold text-green-600">{value.trackable.name}</a></p>
                    <PopupIconButton buttons={[]}/>
                </div>
                {#if value.chart.type === AnalyticsChartType.LINE}
                    {#if value.chart.values.length < 3}
                        <p>Not enough data to show chart</p>
                    {:else}
                        <div class="h-32">
                            <LineChart
                                    hideLabels={true}
                                    hideGrid={true}
                                    minimal={false}
                                    dataPoints={value.chart.values}
                                    labels={value.chart.labels}/>
                        </div>
                    {/if}
                {/if}

                {#if value.chart.type === AnalyticsChartType.PIE}
                    <div class="h-32">
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
