<script lang="ts">
    import ConditionEntry from "@perfice/components/goal/multi/ConditionEntry.svelte";
    import type {GoalConditionValueResult} from "@perfice/stores/goal/value";

    let {value, color}: { value: GoalConditionValueResult[], color: string } = $props();
</script>

<div class="flex flex-col items-start w-full h-full overflow-y-scroll scrollbar-hide">
    {#each value as val}
        <ConditionEntry value={val} color={color}/>
    {/each}
</div>
