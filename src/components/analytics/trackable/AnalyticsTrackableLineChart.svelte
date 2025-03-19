<script lang="ts">
    import {categoryToCssRgb, getChartColors} from "@perfice/util/color";
    import type {LineAnalyticsChartData} from "@perfice/stores/analytics/trackable";
    import SingleChart from "@perfice/components/chart/SingleChart.svelte";

    let {data, name}: { data: LineAnalyticsChartData, name: string } = $props();

    let {fillColor, borderColor} = $derived(getChartColors(categoryToCssRgb(name)));
</script>

<SingleChart
        type="line"
        hideLabels={true}
        hideGrid={true}
        minimal={false}
        legend={false}
        dataPoints={data.values}
        labelFormatter={data.labelFormatter}
        {fillColor}
        {borderColor}
        labels={data.labels}/>
