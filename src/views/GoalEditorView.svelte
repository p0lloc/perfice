<script lang="ts">
    import {onMount} from "svelte";
    import {NEW_GOAL_ROUTE} from "@perfice/model/goal/ui";
    import {goals, variableEditProvider} from "@perfice/main";
    import type {Goal} from "@perfice/model/goal/goal";
    import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
    import type {GoalVariableType} from "@perfice/services/variable/types/goal";

    let {params}: { params: Record<string, string> } = $props();

    let goal = $state<Goal | undefined>(undefined);
    let goalVariable = $state<Variable | undefined>(undefined);
    let goalData = $state<GoalVariableType | null>(null);

    let creating = $state<boolean>(false);

    async function newGoal() {
        creating = true;

        variableEditProvider.newEdit();
        let variable = variableEditProvider.createVariableFromType(VariableTypeName.GOAL);
        if (variable.type.type != VariableTypeName.GOAL) return;

        goal = {
            id: crypto.randomUUID(),
            name: "New goal",
            variableId: variable.id,
        };
        goalVariable = variable;
        goalData = variable.type.value;
    }

    async function loadGoal() {
        let goalId = params.goalId;
        if (goalId == NEW_GOAL_ROUTE) {
            await newGoal();
            return;
        }

        variableEditProvider.newEdit();

        goal = await goals.fetchGoalById(goalId);
        if (goal == null) return;

        goalVariable = variableEditProvider.getVariableById(goal.variableId);
        if (goalVariable == null) return;

        if (goalVariable.type.type != VariableTypeName.GOAL) return;

        goalData = goalVariable.type.value;
    }

    onMount(() => loadGoal());
</script>

<div class="w-1/2 mx-auto mt-8">
    <h1 class="text-4xl font-bold">{creating ? "New goal" : "Edit goal"}</h1>
    {#if goal !== undefined}
        {goal.name}
    {:else}
        <p>Goal not found</p>
    {/if}
</div>
