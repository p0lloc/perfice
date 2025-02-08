<script lang="ts">
    import type {GoalConditionValueResult} from "@perfice/stores/goal/value";
    import {GoalConditionType} from "@perfice/services/variable/types/goal";
    import ComparisonConditionEntry from "@perfice/components/goal/multi/ComparisonConditionEntry.svelte";
    import type {Component} from "svelte";
    import GoalMetConditionEntry from "@perfice/components/goal/multi/GoalMetConditionEntry.svelte";

    let {value, color}: { value: GoalConditionValueResult, color: string } = $props();

    const RENDERERS: Record<GoalConditionType, Component<{ value: any, color: string }>> = {
        [GoalConditionType.COMPARISON]: ComparisonConditionEntry,
        [GoalConditionType.GOAL_MET]: GoalMetConditionEntry,
    }

    let RendererComponent = $derived(RENDERERS[value.type]);
</script>

<div class="p-2 gap-2 w-full border-b">
    <RendererComponent value={value.value} {color} />
</div>
