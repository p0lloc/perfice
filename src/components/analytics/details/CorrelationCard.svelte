<script lang="ts">
    import type {DetailCorrelation} from "@perfice/stores/analytics/analytics";
    import CorrelationBar from "@perfice/components/analytics/details/CorrelationBar.svelte";
    import {faLineChart} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import DualLineChart from "@perfice/components/chart/DualLineChart.svelte";
    import {formatTimestampYYYYMMDD} from "@perfice/util/time/format";
    import {normalizeNumberArray} from "@perfice/services/analytics/analytics.js";
    import {ellipsis} from "@perfice/services/analytics/display.js";
    import CorrelationMessage from "@perfice/components/analytics/details/CorrelationMessage.svelte";

    const LEGEND_LABEL_MAX_LENGTH = 8;

    let {correlation, class: className = '', fullBar = false}: {
        correlation: DetailCorrelation,
        class?: string,
        fullBar?: boolean
    } = $props();
    let chartVisible = $state(false);

    function showChart() {
        chartVisible = !chartVisible;
    }

    function convertNumbersForChart(first: number[], second: number[], lag: boolean, chartVisible: boolean): [number[], number[]] {
        // No need to convert if chart is not visible
        if (!chartVisible) return [first, second];

        let firstNormalized = normalizeNumberArray(first);
        let secondNormalized = normalizeNumberArray(second);

        if (!lag)
            return [firstNormalized, secondNormalized];

        return [[0, ...secondNormalized.slice(0, -1)], firstNormalized];
    }

    function convertLabelForDisplay(val: string): string {
        return ellipsis(val, LEGEND_LABEL_MAX_LENGTH);
    }

    function convertLabelsForChart(first: string, second: string, chartVisible: boolean): [string, string] {
        // No need to convert if chart is not visible
        if (!chartVisible) return [first, second];

        let convertedFirst = convertLabelForDisplay(first);
        let convertedSecond = convertLabelForDisplay(second);

        return [convertedFirst, convertedSecond];
    }

    let [first, second] = $derived(convertNumbersForChart(correlation.value.first,
        correlation.value.second, correlation.value.lagged, chartVisible));

    let [firstLabel, secondLabel] = $derived(convertLabelsForChart(correlation.display.first.entityName,
        correlation.display.second.entityName, chartVisible));
</script>
<div class="bg-white rounded border p-2 {className}">
    <div class="row-between">
        <CorrelationMessage positive={correlation.value.coefficient > 0} display={correlation.display}/>
        <IconButton onClick={showChart} icon={faLineChart} class="text-gray-400"/>
    </div>
    {#if chartVisible}
        <div class="h-36">
            <DualLineChart {first}
                           {second}
                           {firstLabel}
                           {secondLabel}
                           firstFillColor="#9BD0F533"
                           firstBorderColor="#36A2EB"
                           secondFillColor="#f59b9b33"
                           secondBorderColor="#eb363c"
                           labels={correlation.value.timestamps.map(v => formatTimestampYYYYMMDD(v))}/>
        </div>
    {:else}
    {/if}
    <div class="row-gap">
        <CorrelationBar
                full={fullBar}
                coefficient={correlation.value.coefficient}
        />
        <div class="flex justify-end text-gray-400 font-bold">
            {Math.round(correlation.value.coefficient * 100)}%
        </div>
    </div>
</div>
