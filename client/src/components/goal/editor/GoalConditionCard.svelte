<script lang="ts">

    import {type GoalCondition, GoalConditionType} from "@perfice/services/variable/types/goal";
    import {GOAL_CONDITION_TYPES, type GoalSidebarAction} from "@perfice/model/goal/ui";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import type {Component} from "svelte";
    import ComparisonConditionRenderer
        from "@perfice/components/goal/editor/condition/comparison/ComparisonConditionRenderer.svelte";
    import GoalMetConditionRenderer
        from "@perfice/components/goal/editor/condition/goalMet/GoalMetConditionRenderer.svelte";

    let {goalId, condition, onOpenSidebar, onUpdate, onDelete}: {
        goalId: string,
        condition: GoalCondition,
        onOpenSidebar: (v: GoalSidebarAction) => void,
        onUpdate: (c: GoalCondition) => void
        onDelete: () => void
    } = $props();

    const RENDERERS: Partial<Record<GoalConditionType, Component<{
        goalId: string,
        condition: any,
        onValueChange: (v: any) => void,
        onSidebar: (v: GoalSidebarAction) => void
    }>>> = {
        [GoalConditionType.COMPARISON]: ComparisonConditionRenderer,
        [GoalConditionType.GOAL_MET]: GoalMetConditionRenderer,
    };

    function onValueChange(v: any) {
        onUpdate({...condition, value: v});
    }

    const RendererComponent = $derived(RENDERERS[condition.type]);

    let name = $derived(GOAL_CONDITION_TYPES.find(t => t.type == condition.type)?.name ?? "Unknown");
</script>

<div class="bg-white border rounded-xl p-4">
    <div class="row-between text-gray-500 mb-2">
        {name}
        <IconButton icon={faTrash} onClick={onDelete}/>
    </div>
    <RendererComponent {goalId} condition={condition.value} {onValueChange} onSidebar={onOpenSidebar}/>
</div>
