<script lang="ts">
    import {onMount} from "svelte";
    import {type GoalSidebarAction, GoalSidebarActionType, NEW_GOAL_ROUTE} from "@perfice/model/goal/ui";
    import {back, goals, variableEditProvider} from "@perfice/main";
    import type {Goal} from "@perfice/model/goal/goal";
    import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
    import {type GoalCondition, GoalVariableType} from "@perfice/services/variable/types/goal";
    import ColorPickerButton from "@perfice/components/base/color/ColorPickerButton.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import {faArrowLeft, faCheck, faPlusCircle, faTrash} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import GoalEditorSidebar from "@perfice/components/goal/editor/sidebar/GoalEditorSidebar.svelte";
    import GoalConditionCard from "@perfice/components/goal/editor/GoalConditionCard.svelte";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import {goto} from "@mateothegreat/svelte5-router";

    let {params}: { params: Record<string, string> } = $props();

    let sidebar: GoalEditorSidebar;

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

    function addCondition() {
        if (goalData == null || goalVariable == null) return;

        openSidebar({
            type: GoalSidebarActionType.ADD_CONDITION, value: {
                onConditionSelected: (c: GoalCondition) => {
                    goalData = new GoalVariableType(goalData!.getConditions().concat([c]), goalData!.getTimeScope());
                }
            }
        });
    }

    function openSidebar(action: GoalSidebarAction) {
        // Delay opening so that the click doesn't immediately close the sidebar
        setTimeout(() => sidebar.open(action));
    }

    function onConditionUpdate(condition: GoalCondition) {
        if (goalData == null || goalVariable == null) return;
        goalData = new GoalVariableType(
            updateIdentifiedInArray(goalData.getConditions(), condition), goalData.getTimeScope());
    }

    function onConditionDelete(condition: GoalCondition) {
        if (goalData == null || goalVariable == null) return;
        goalData = new GoalVariableType(
            deleteIdentifiedInArray(goalData.getConditions(), condition.id), goalData.getTimeScope());
    }

    async function save() {
        if (goal == null || goalData == null || goalVariable == null) return;

        // @ts-ignore
        let variable: Variable = $state.snapshot<Variable>(goalVariable);
        variable.type.value = goalData;
        variableEditProvider.updateVariable(variable);
        await variableEditProvider.save();

        let goalSnapshot: Goal = $state.snapshot(goal);
        if (creating) {
            await goals.createGoal(goalSnapshot.name, variable);
        } else {
            await goals.updateGoal(goalSnapshot);
        }

        goto("/goals");
    }

    function discard() {
        back();
    }

    function closeSidebar(){
        sidebar.close();
    }

    onMount(() => loadGoal());
</script>

<svelte:body onclick={closeSidebar} />
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
    <div class="flex items-center gap-4">
        <h1 class="text-4xl font-bold hidden md:block">{creating ? "New goal" : "Edit goal"}</h1>
        <button>
            <Fa icon={faTrash}/>
        </button>
    </div>
    <div class="md:w-1/2 md:p-0 p-4">
        {#if goal != null && goalData != null}
            <p class="block mb-2 label mt-4">Name & color</p>
            <div class="row-gap">
                <input bind:value={goal.name} placeholder="Goal name" type="text" class="input">
                <ColorPickerButton value="#ff0000"/>
            </div>

            <p class="block mb-2 label mt-4">Conditions</p>
            <div class="flex flex-col gap-2 mt-2">
                {#each goalData.getConditions() as condition(condition.id)}
                    <GoalConditionCard {condition}
                                       onOpenSidebar={openSidebar}
                                       onUpdate={(condition) => onConditionUpdate(condition)}
                                       onDelete={() => onConditionDelete(condition)}
                    />
                {/each}
                <button class="horizontal-add-button rounded-xl" onclick={addCondition}>
                    <Fa icon={faPlusCircle} class="pointer-events-none"/>
                </button>
            </div>

        {:else}
            <p>Goal not found</p>
        {/if}
    </div>
    <div class="md:flex hidden items-center gap-2 mt-6">
        <Button onClick={save}>Save</Button>
        <Button onClick={discard} color={ButtonColor.RED}>Discard</Button>
    </div>
</div>
<GoalEditorSidebar bind:this={sidebar}/>
