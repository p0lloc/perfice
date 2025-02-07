<script lang="ts">
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import ConditionEntry from "@perfice/components/goal/multi/ConditionEntry.svelte";

    let {value}: { value: Record<string, PrimitiveValue> } = $props();
</script>

<div class="flex flex-col items-start w-full h-full overflow-y-scroll scrollbar-hide">
    {#each Object.entries(value) as [key, val]}
        <ConditionEntry value={val} color="magenta"/>
    {/each}
</div>
