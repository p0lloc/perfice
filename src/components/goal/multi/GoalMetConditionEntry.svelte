<script lang="ts">
    import type {GoalMetValueResult} from "@perfice/stores/goal/value";
    import GoalMetIndicator from "@perfice/components/goal/GoalMetIndicator.svelte";

    let {value}: { value: GoalMetValueResult, color: string } = $props();
</script>

<div class="row-between">
    <GoalMetIndicator value={value.met}/>
    {value.name}
</div>
