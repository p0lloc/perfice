<script lang="ts">
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import type {TrackableChartSettings} from "@perfice/model/trackable/trackable";
    import {getChartColors} from "@perfice/util/color";
    import SingleChart from "@perfice/components/chart/SingleChart.svelte";

    let {value, cardSettings}: { value: PrimitiveValue, cardSettings: TrackableChartSettings, date: Date } = $props();

    let dataPoints = $derived.by(() => {
        if (value.type == PrimitiveValueType.LIST) {
            return value.value
                .map(v => v?.value as number ?? 0)
                .toReversed();
        }

        return [];
    });


    let {fillColor, borderColor} = $derived(getChartColors(cardSettings.color));
</script>


<div class="w-full h-full rounded-md">
    <SingleChart type="line" fillColor={fillColor} borderColor={borderColor} hideGrid={true} hideLabels={true}
                 dataPoints={dataPoints}
                 labels={dataPoints.map((_, i) => i.toString())}/>
</div>
