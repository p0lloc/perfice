<script lang="ts">
    import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {Component} from "svelte";
    import SingleConditionRenderer from "@perfice/components/goal/single/SingleConditionRenderer.svelte";
    import MultiConditionRenderer from "@perfice/components/goal/multi/MultiConditionRenderer.svelte";
    import type {GoalConditionValueResult} from "@perfice/stores/goal/value";

    let {value, color}: { value: GoalConditionValueResult[], color: string } = $props();

    function getRenderer(value: GoalConditionValueResult[]): [Component<{
        value: any,
        color: string
    }> | null, any] {
        let values = Object.values(value);
        if (values.length == 0) return [null, pNull()];

        if (values.length > 1) {
            return [MultiConditionRenderer, value];
        } else {
            return [SingleConditionRenderer, values[0]];
        }
    }

    const [RendererComponent, result] = $derived(getRenderer(value));
</script>

<div class="flex-1 w-full overflow-y-scroll scrollbar-hide">
    {#if RendererComponent != null}
        <RendererComponent value={result} {color}/>
    {:else}
        <div class="flex-center w-full h-full">
            <span class="text-xs">Goal has no conditions</span>
        </div>
    {/if}
</div>
