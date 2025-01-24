<script lang="ts">
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import LineChart from "@perfice/components/chart/LineChart.svelte";
    import type {TrackableChartSettings} from "@perfice/model/trackable/trackable";

    let {value}: { value: PrimitiveValue, cardSettings: TrackableChartSettings } = $props();

    let dataPoints = $derived.by(() => {
        if (value.type == PrimitiveValueType.LIST) {
            return value.value
                .map(v => v.value)
                .toReversed();
        }

        return [];
    });
</script>


<div class="w-full h-full rounded-md">
    <LineChart hideGrid={true} hideLabels={true} dataPoints={dataPoints}
               labels={dataPoints.map((_, i) => i.toString())}/>
</div>
