<script lang="ts">
    import {faCog} from "@fortawesome/free-solid-svg-icons";
    import {AnalyticsChartType, type TrackableAnalyticsResult} from "@perfice/stores/analytics/trackable.js";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";
    import PieChart from "@perfice/components/chart/PieChart.svelte";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import AnalyticsTrackableLineChart
        from "@perfice/components/analytics/trackable/AnalyticsTrackableLineChart.svelte";

    let {value, onEditSettings}: { value: TrackableAnalyticsResult, onEditSettings: () => void } = $props();

    function generateLink(trackable: Trackable): string {
        return `/analytics/trackable:${trackable.id}`;
    }
</script>

<div class="bg-white rounded p-4 border">
    <div class="flex justify-between items-center mb-2">
        <p><a href={generateLink(value.trackable)}
              class="text-xl font-bold text-green-600">{value.trackable.name}</a></p>
        <PopupIconButton buttons={[
                        {
                            icon: faCog,
                            name: "Settings",
                            action: () => onEditSettings()
                        }
                    ]}/>
    </div>
    {#if value.chart.type === AnalyticsChartType.LINE}
        {#if value.chart.values.length < 3}
            <p>Not enough data to show chart</p>
        {:else}
            <div class="h-32">
                <AnalyticsTrackableLineChart name={value.trackable.name} data={value.chart}/>
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