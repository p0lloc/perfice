<script lang="ts">
    import {categoryToCssRgb, getChartColors} from "@perfice/util/color";
    import type {LineAnalyticsChartData} from "@perfice/stores/analytics/trackable";
    import LineChart from "@perfice/components/chart/LineChart.svelte";

    let {data, name}: { data: LineAnalyticsChartData, name: string } = $props();

    let {fillColor, borderColor} = $derived(getChartColors(categoryToCssRgb(name)));
</script>

<LineChart
        hideLabels={true}
        hideGrid={true}
        minimal={false}
        dataPoints={data.values}
        labelFormatter={data.labelFormatter}
        {fillColor}
        {borderColor}
        labels={data.labels}/>
