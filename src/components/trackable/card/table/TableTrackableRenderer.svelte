<script lang="ts">
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {TrackableValueSettings} from "@perfice/model/trackable/trackable";
    import TrackableTableEntry from "@perfice/components/trackable/card/table/TrackableTableEntry.svelte";

    let {value, cardSettings}: { value: PrimitiveValue, cardSettings: TrackableValueSettings } = $props();

    let values = $derived(value.value as PrimitiveValue[]);
</script>
<div class="flex h-full flex-col overflow-y-scroll scrollbar-hide">
    {#each values as value}
        <TrackableTableEntry value={value} representation={cardSettings.representation} />
    {:else}
        <div class="justify-center items-center flex flex-1">
            No values
        </div>
    {/each}
</div>
