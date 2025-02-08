<script lang="ts">
    import {GoalConditionType} from "@perfice/services/variable/types/goal";
    import type {Component} from "svelte";
    import ComparisonSingleCondition from "@perfice/components/goal/single/ComparisonSingleCondition.svelte";
    import GoalMetSingleCondition from "@perfice/components/goal/single/GoalMetSingleCondition.svelte";
    import type {GoalConditionValueResult} from "@perfice/stores/goal/value";

    let {value, color}: { value: GoalConditionValueResult, color: string } = $props();

    const RENDERERS: Record<GoalConditionType, Component<{ value: any, color: string }>> = {
        [GoalConditionType.COMPARISON]: ComparisonSingleCondition,
        [GoalConditionType.GOAL_MET]: GoalMetSingleCondition,
    }

    let RendererComponent = $derived(RENDERERS[value.type]);
</script>

<div class="flex-center h-full">
    <RendererComponent value={value.value} {color} />
</div>
