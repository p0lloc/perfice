<script lang="ts" generics="T">
    import InvertedSegment from "./InvertedSegment.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {SegmentedItem} from "@perfice/model/ui/segmented";

    let {segments, value, onChange, class: className = 'w-screen'}: {
        segments: SegmentedItem<T>[],
        value: T,
        onChange?: (value: T) => void,
        class?: string
    } = $props();

    function onSegmentClick(value: SegmentedItem<T>) {
        value.onClick?.();

        if (value.value != null && onChange != null) {
            onChange(value.value);
        }
    }
</script>

<div class="bg-green-700 min-w-0 flex-1 flex p-1 md:p-2 gap-1 overflow-x-auto min-h-10 {className}">
    {#each segments as segment}
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
