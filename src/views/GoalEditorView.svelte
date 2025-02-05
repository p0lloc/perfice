<script lang="ts">
    import {onMount} from "svelte";
    import {NEW_GOAL_ROUTE} from "@perfice/model/goal/ui";
    import {goals} from "@perfice/main";
    import type {Goal} from "@perfice/model/goal/goal";

    let {params}: { params: Record<string, string> } = $props();

    let goal = $state<Goal | undefined>(undefined);

    let creating = $state<boolean>(false);

    async function newGoal() {
        creating = true;

        goal = {
            id: crypto.randomUUID(),
            name: "New goal",
            variableId: crypto.randomUUID(),
        };
    }

    async function loadGoal() {
        let goalId = params.goalId;
        if (goalId == NEW_GOAL_ROUTE) {
            await newGoal();
            return;
        }

        goal = await goals.fetchGoalById(goalId);
        console.log(goalId);
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
