<script lang="ts" generics="T">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {SegmentedItem} from "@perfice/model/ui/segmented";
    import Segment from "@perfice/components/base/segmented/Segment.svelte";

    let {
        segments,
        value,
        class: className,
        onChange,
        inverted = false,
        disabled = false,
        comparisonFunction = (first, second) => first === second,
        segmentClass
    }: {
        segments: SegmentedItem<T>[],
        value: T,
        class?: string,
        onChange?: (value: T) => void,
        inverted?: boolean,
        disabled?: boolean,
        comparisonFunction?: (first: T | undefined, second: T | undefined) => boolean
        segmentClass?: string
    } = $props();

    function onSegmentClick(value: SegmentedItem<T>) {
        if(disabled) return;
        value.onClick?.();

        if (value.value != null && onChange != null) {
            onChange(value.value);
        }
    }
</script>

<div class:segmented-normal="{!inverted}" class:segmented-inverted="{inverted}" class="inline-flex min-w-0 {className}">
    {#each segments as segment (segment.value)}
        <Segment class={segmentClass} active={comparisonFunction(value, segment.value)} {inverted}
                 onClick={() => onSegmentClick(segment)}>

            {#if segment.prefix != null}
                <Fa icon={segment.prefix}/>
            {/if}
            {segment.name}
            {#if segment.suffix != null}
                <Fa icon={segment.suffix}/>
            {/if}
        </Segment>
    {/each}
</div>

<style>
    .segmented-normal {
        @apply bg-gray-200 p-0.5 rounded-xl;
    }

    .segmented-inverted {
        @apply bg-green-700 p-2 md:p-2.5 gap-1;
    }
</style>
