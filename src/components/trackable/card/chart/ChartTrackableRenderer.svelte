<script lang="ts">
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import LineChart from "@perfice/components/chart/LineChart.svelte";
    import type {TrackableChartSettings} from "@perfice/model/trackable/trackable";
    import {hexToRgb, rgbaToHex} from "@perfice/util/color";

    let {value, cardSettings}: { value: PrimitiveValue, cardSettings: TrackableChartSettings } = $props();
    const FILL_OPACITY = 100;
    const BORDER_DARKNESS_MODIFIER = 25;

    let dataPoints = $derived.by(() => {
        if (value.type == PrimitiveValueType.LIST) {
            return value.value
                .map(v => v.value)
                .toReversed();
        }

        return [];
    });

    function getColors(color: string): { fillColor: string, borderColor: string } {
        let {r, g, b} = hexToRgb(color);
        return {
            fillColor: rgbaToHex(r, g, b, FILL_OPACITY),
            borderColor: rgbaToHex(
                r - BORDER_DARKNESS_MODIFIER,
                g - BORDER_DARKNESS_MODIFIER,
                b - BORDER_DARKNESS_MODIFIER,
                255),
        }
    }

    let {fillColor, borderColor} = $derived(getColors(cardSettings.color));
</script>


<div class="w-full h-full rounded-md">
    <LineChart fillColor={fillColor} borderColor={borderColor} hideGrid={true} hideLabels={true} dataPoints={dataPoints}
               labels={dataPoints.map((_, i) => i.toString())}/>
</div>
