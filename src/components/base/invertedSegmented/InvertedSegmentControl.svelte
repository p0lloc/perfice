<script lang="ts" generics="T">
    import InvertedSegment from "./InvertedSegment.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {SegmentedItem} from "@perfice/model/ui/segmented";

    let {segments, value, onChange}: {
        segments: SegmentedItem<T>[],
        value: T,
        onChange?: (value: T) => void
    } = $props();

    function onSegmentClick(value: SegmentedItem<T>) {
        value.onClick?.();

        if(value.value != null && onChange != null) {
            onChange(value.value);
        }
    }
</script>

<div class="bg-green-700 inline-flex min-w-0 p-2 md:p-2.5 gap-1">
    {#each segments as segment (segment.value)}
        <InvertedSegment active={value === segment.value}
                         onClick={() => onSegmentClick(segment)}>

            {#if segment.prefix != null}
                <Fa icon={segment.prefix}/>
            {/if}
            {segment.name}
            {#if segment.suffix != null}
                <Fa icon={segment.suffix}/>
            {/if}
        </InvertedSegment>
    {/each}
</div>
