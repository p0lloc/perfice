<script lang="ts">
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import LineChart from "@perfice/components/chart/LineChart.svelte";
    import type {TrackableChartSettings} from "@perfice/model/trackable/trackable";
    import {getChartColors, hexToRgb, rgbaToHex} from "@perfice/util/color";

    let {value, cardSettings}: { value: PrimitiveValue, cardSettings: TrackableChartSettings, date: Date } = $props();

    let dataPoints = $derived.by(() => {
        if (value.type == PrimitiveValueType.LIST) {
            return value.value
                .map(v => v.value)
                .toReversed();
        }

        return [];
    });


    let {fillColor, borderColor} = $derived(getChartColors(cardSettings.color));
</script>


<div class="w-full h-full rounded-md">
    <LineChart fillColor={fillColor} borderColor={borderColor} hideGrid={true} hideLabels={true} dataPoints={dataPoints}
               labels={dataPoints.map((_, i) => i.toString())}/>
</div>
