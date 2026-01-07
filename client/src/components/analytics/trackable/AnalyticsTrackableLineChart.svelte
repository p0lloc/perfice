<script lang="ts">
    import {categoryToCssRgb, getChartColors} from "@perfice/util/color";
    import type {LineAnalyticsChartData} from "@perfice/stores/analytics/trackable";
    import SingleChart from "@perfice/components/chart/SingleChart.svelte";

    let {data, name}: { data: LineAnalyticsChartData, name: string } = $props();

    let {fillColor, borderColor} = $derived(getChartColors(categoryToCssRgb(name)));
</script>

<SingleChart
        type="line"
        hideLabels={false}
        hideGrid={true}
        minimal={false}
        maxTicksLimit={5}
        legend={false}
        dataPoints={data.values}
        blur={data.blur}
        labelFormatter={data.labelFormatter}
        {fillColor}
        {borderColor}
        labels={data.labels}/>
