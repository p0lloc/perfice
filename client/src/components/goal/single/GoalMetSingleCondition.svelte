<script lang="ts">
    import GoalMetIndicator from "@perfice/components/goal/GoalMetIndicator.svelte";
    import type {GoalMetValueResult} from "@perfice/stores/goal/value";

    let {value}: { value: GoalMetValueResult, color: string } = $props();
</script>

<div class="flex flex-col text-3xl">
    <GoalMetIndicator value={value.met}/>
    <p class="text-base">{value.name}</p>
</div>
