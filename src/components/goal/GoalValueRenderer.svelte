<script lang="ts">
    import {pNull, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import type {Component} from "svelte";
    import SingleConditionRenderer from "@perfice/components/goal/single/SingleConditionRenderer.svelte";
    import MultiConditionRenderer from "@perfice/components/goal/multi/MultiConditionRenderer.svelte";

    let {value, color}: { value: PrimitiveValue, color: string } = $props();

    function getRenderer(value: PrimitiveValue): [Component<{
        value: PrimitiveValue,
        color: string
    }> | null, PrimitiveValue] {
        if (value.type != PrimitiveValueType.MAP) throw new Error("Expected map value");

        let values = Object.values(value.value);
        if (values.length == 0) return [null, pNull()];

        if (values.length > 1) {
            return [MultiConditionRenderer, value];
        } else {
            return [SingleConditionRenderer, values[0]];
        }
    }

    const [RendererComponent, result] = $derived(getRenderer(value));
</script>

{#if RendererComponent != null}
    <RendererComponent value={result} {color}/>
{:else}
    This goal has no conditions
{/if}
