<script lang="ts">
    import {onMount} from "svelte";
    import {NEW_GOAL_ROUTE} from "@perfice/model/goal/ui";
    import {back, goals, variableEditProvider} from "@perfice/main";
    import type {Goal} from "@perfice/model/goal/goal";
    import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
    import type {GoalVariableType} from "@perfice/services/variable/types/goal";
    import ColorPickerButton from "@perfice/components/base/color/ColorPickerButton.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import {faArrowLeft, faCheck, faPlusCircle} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";

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

    function save() {
    }

    function discard() {
        back();
    }

    onMount(() => loadGoal());
</script>

<div class="md:w-1/2 mx-auto md:mt-8">
    <MobileTopBar title={creating ? "New goal" : "Edit goal"}>
        {#snippet leading()}
            <button class="icon-button" onclick={discard}>
                <Fa icon={faArrowLeft}/>
            </button>
        {/snippet}
        {#snippet actions()}
            <button class="icon-button" onclick={save}>
                <Fa icon={faCheck}/>
            </button>
        {/snippet}
    </MobileTopBar>
    <h1 class="text-4xl font-bold hidden md:block">{creating ? "New goal" : "Edit goal"}</h1>
    <div class="md:w-1/2 p-4">
        {#if goal !== undefined}
            <p class="block mb-2 label mt-4">Name & color</p>
            <div class="row-gap">
                <input bind:value={goal.name} placeholder="Goal name" type="text" class="input">
                <ColorPickerButton value="#ff0000"/>
            </div>

            <p class="block mb-2 label mt-4">Conditions</p>
            <button class="horizontal-add-button">
                <Fa icon={faPlusCircle} class="pointer-events-none"/>
            </button>

            <div class="hidden mt-4 md:flex items-center gap-2">
                <Button onClick={save}>Save</Button>
                <Button onClick={discard} color={ButtonColor.RED}>Discard</Button>
            </div>
        {:else}
            <p>Goal not found</p>
        {/if}
    </div>
</div>
