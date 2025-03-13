<script lang="ts">
    import type {DetailCorrelation} from "@perfice/stores/analytics/analytics";
    import CorrelationBar from "@perfice/components/analytics/details/CorrelationBar.svelte";
    import {faLineChart} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import DualLineChart from "@perfice/components/chart/DualLineChart.svelte";
    import {formatTimestampYYYYMMDD} from "@perfice/util/time/format";
    import {normalizeNumberArray} from "@perfice/services/analytics/analytics.js";
    import {ellipsis} from "@perfice/services/analytics/display.js";

    const LEGEND_LABEL_MAX_LENGTH = 8;

    let {correlation}: { correlation: DetailCorrelation } = $props();
    let chartVisible = $state(false);

    function showChart() {
        chartVisible = !chartVisible;
    }

    function convertForDisplay(first: number[], second: number[], lag: boolean): [number[], number[]] {
        let firstNormalized = normalizeNumberArray(first);
        let secondNormalized = normalizeNumberArray(second);

        if (!lag)
            return [firstNormalized, secondNormalized];

        return [firstNormalized, [0, ...secondNormalized.slice(0, -1)]];
    }

    let [first, second] = $derived(convertForDisplay(correlation.value.first,
        correlation.value.second, correlation.value.lagged));
</script>
<div class="bg-white rounded border p-2">
    <div class="row-between"><p class="mb-2">{correlation.display.result}</p>
        <IconButton onClick={showChart} icon={faLineChart} class="text-gray-400"/>
    </div>
    {#if chartVisible}
        <div class="h-36">
            <DualLineChart {first}
                           {second}
                           firstLabel={ellipsis(correlation.display.first, LEGEND_LABEL_MAX_LENGTH)}
                           secondLabel={ellipsis(correlation.display.second, LEGEND_LABEL_MAX_LENGTH)}
                           firstFillColor="#9BD0F533"
                           firstBorderColor="#36A2EB"
                           secondFillColor="#f59b9b33"
                           secondBorderColor="#eb363c"
                           labels={correlation.value.timestamps.map(v => formatTimestampYYYYMMDD(v))}/>
        </div>
    {:else}
        <CorrelationBar
                coefficient={correlation.value.coefficient}
        />
    {/if}
    <div class="flex justify-end text-gray-400 font-bold">
        {Math.round(correlation.value.coefficient * 100)}%
    </div>
</div>
