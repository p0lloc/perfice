<script lang="ts">
    import {GoalMetGoalCondition} from "@perfice/services/variable/types/goal";
    import type {GoalSidebarAction} from "@perfice/model/goal/ui";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {variableEditProvider} from "@perfice/app";
    import {VariableTypeName} from "@perfice/model/variable/variable";

    let {condition, onValueChange}: {
        condition: GoalMetGoalCondition,
        onValueChange: (v: GoalMetGoalCondition) => void,
        onSidebar: (v: GoalSidebarAction) => void
    } = $props();

    let goalId = $state(condition.getGoalVariableId());

    function onGoalIdChange(id: string) {
        goalId = id;
        onValueChange(new GoalMetGoalCondition(goalId));
    }

    let goals = $derived(variableEditProvider.getVariables()
        .filter(v => v.type.type == VariableTypeName.GOAL)
        .map(v => {
            return {
                value: v.id,
                name: v.name,
            }
        }));
</script>

<div class="row-between">
    Goal
    <DropdownButton items={goals} value={goalId} onChange={onGoalIdChange}/>
</div>
