<script lang="ts">
    import {faCog} from "@fortawesome/free-solid-svg-icons";
    import {AnalyticsChartType, type TrackableAnalyticsResult} from "@perfice/stores/analytics/trackable.js";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";
    import PieChart from "@perfice/components/chart/PieChart.svelte";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import AnalyticsTrackableLineChart
        from "@perfice/components/analytics/trackable/AnalyticsTrackableLineChart.svelte";
    import {navigate} from "@perfice/app";

    let {value, onEditSettings}: { value: TrackableAnalyticsResult, onEditSettings: () => void } = $props();

    function generateLink(trackable: Trackable): string {
        return `/analytics/trackable:${trackable.id}`;
    }
</script>

<div class="card p-4">
    <div class="flex justify-between items-center mb-2">
        <p>
            <button onclick={() => navigate(generateLink(value.trackable))}
                    class="text-xl font-bold dark:text-green-400 text-green-600">{value.trackable.name}</button>
        </p>
        <PopupIconButton buttons={[
                        {
                            icon: faCog,
                            name: "Settings",
                            action: () => onEditSettings()
                        }
                    ]}/>
    </div>
    {#if value.chart.type === AnalyticsChartType.LINE}
        <div class="h-32">
            <AnalyticsTrackableLineChart name={value.trackable.name} data={value.chart}/>
        </div>
    {/if}

    {#if value.chart.type === AnalyticsChartType.PIE}
        {#if Object.keys(value.chart.values).length < 1}
            <p>Not enough data to show chart</p>
        {:else}
            ok
            <div class="h-32">
                <PieChart
                        hideLabels={true}
                        hideGrid={true}
                        dataPoints={value.chart.values}/>
            </div>
        {/if}
    {/if}
</div>