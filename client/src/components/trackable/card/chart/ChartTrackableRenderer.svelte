<script lang="ts">
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import type {TrackableChartSettings} from "@perfice/model/trackable/trackable";
    import {getChartColors} from "@perfice/util/color";
    import SingleChart from "@perfice/components/chart/SingleChart.svelte";
    import {darkMode} from "@perfice/stores/ui/darkmode";

    let {value, cardSettings, preview}: {
        value: PrimitiveValue,
        cardSettings: TrackableChartSettings,
        date: Date,
        preview: boolean
    } = $props();

    const PLACEHOLDER_DATA = [130.0, 73.0, 69.0, 110.0, 90.0, 130.0, 73.0, 69.0, 110.0, 90.0];

    let [dataPoints, empty] = $derived.by(() => {
        if (preview) {
            return [PLACEHOLDER_DATA, false];
        }

        let empty = true;
        let values = [];
        if (value.type == PrimitiveValueType.LIST) {
            for (let i = value.value.length - 1; i >= 0; i--) {
                let v = value.value[i].value as number ?? 0;
                if (v != 0) {
                    empty = false;
                }

                values.push(v);
            }

            if (empty) {
                return [PLACEHOLDER_DATA, true];
            }

            return [values, empty];
        }

        return [[], empty];
    });


    let {fillColor, borderColor} = $derived(getChartColors(cardSettings.color, $darkMode));
</script>


<div class="w-full h-full rounded-md">
    <SingleChart type="line" fillColor={fillColor} borderColor={borderColor} hideGrid={true} hideLabels={true}
                 dataPoints={dataPoints}
                 blur={empty}
                 labels={dataPoints.map((_, i) => i.toString())}/>
</div>
