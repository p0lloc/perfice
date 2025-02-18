<script lang="ts">
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {TableTrackableValueSettings, TrackableValueSettings} from "@perfice/model/trackable/trackable";
    import TrackableTableEntry from "@perfice/components/trackable/card/value/table/TrackableTableEntry.svelte";

    let {values, cardSettings}: {
        values: PrimitiveValue[],
        cardSettings: TrackableValueSettings,
        valueSettings: TableTrackableValueSettings,
        date: Date
    } = $props();
</script>
<div class="flex h-full flex-col overflow-y-scroll scrollbar-hide">
    {#each values as value}
        <TrackableTableEntry value={value} representation={cardSettings.representation}/>
    {:else}
        <div class="justify-center items-center flex flex-1">
            No values
        </div>
    {/each}
</div>
