<script lang="ts">
    import {GoalMetGoalCondition} from "@perfice/services/variable/types/goal";
    import type {GoalSidebarAction} from "@perfice/model/goal/ui";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {VariableTypeName} from "@perfice/model/variable/variable";
    import {variableEditProvider} from "@perfice/stores";

    let {goalId, condition, onValueChange}: {
        goalId: string,
        condition: GoalMetGoalCondition,
        onValueChange: (v: GoalMetGoalCondition) => void,
        onSidebar: (v: GoalSidebarAction) => void
    } = $props();

    let selectedGoalId = $state(condition.getGoalVariableId());

    function onGoalIdChange(id: string) {
        selectedGoalId = id;
        onValueChange(new GoalMetGoalCondition(selectedGoalId));
    }

    let goals = $derived(variableEditProvider.getVariables()
        .filter(v => v.type.type == VariableTypeName.GOAL && v.id != goalId)
        .map(v => {
            return {
                value: v.id,
                name: v.name,
            }
        }));
</script>

<div class="row-between">
    Goal
    <DropdownButton items={goals} value={selectedGoalId} onChange={onGoalIdChange}/>
</div>
