<script lang="ts">
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {
        type TrackableValueSettings,
        TrackableValueType
    } from "@perfice/model/trackable/trackable";
    import type {Component} from "svelte";
    import TableTrackableRenderer from "@perfice/components/trackable/card/value/table/TableTrackableRenderer.svelte";
    import LatestTrackableRenderer
        from "@perfice/components/trackable/card/value/latest/LatestTrackableRenderer.svelte";

    let {value, cardSettings, date}: {
        value: PrimitiveValue,
        cardSettings: TrackableValueSettings,
        date: Date
    } = $props();

    let values = $derived(value.value as PrimitiveValue[]);

    let RENDERERS: Record<TrackableValueType, Component<{
        values: PrimitiveValue[],
        cardSettings: TrackableValueSettings,
        valueSettings: any,
        date: Date
    }>> = {
        [TrackableValueType.TABLE]: TableTrackableRenderer,
        [TrackableValueType.LATEST]: LatestTrackableRenderer,
    }

    const RendererComponent = $derived(RENDERERS[cardSettings.type]);
</script>

{#if values != null}
    <RendererComponent values={values} cardSettings={cardSettings} valueSettings={cardSettings.settings} date={date}/>
{/if}
