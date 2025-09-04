<script lang="ts">
    import {onMount} from "svelte";
    import {type GoalSidebarAction, GoalSidebarActionType, NEW_GOAL_ROUTE} from "@perfice/model/goal/ui";
    import {goals, variableEditProvider} from "@perfice/stores";
    import type {Goal} from "@perfice/model/goal/goal";
    import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
    import {type GoalCondition, GoalVariableType} from "@perfice/services/variable/types/goal";
    import ColorPickerButton from "@perfice/components/base/color/ColorPickerButton.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import {faArrowLeft, faCheck, faPlusCircle} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import GoalEditorSidebar from "@perfice/components/goal/editor/sidebar/GoalEditorSidebar.svelte";
    import GoalConditionCard from "@perfice/components/goal/editor/GoalConditionCard.svelte";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import TimeScopePicker from "@perfice/components/base/timeScope/TimeScopePicker.svelte";
    import {type TimeScope} from "@perfice/model/variable/time/time";
    import {back, navigate} from "@perfice/app";
    import {createDefaultWeekDays, GoalStreakVariableType} from "@perfice/services/variable/types/goalStreak";
    import WeekDays from "@perfice/components/base/weekDays/WeekDays.svelte";

    let {params}: { params: Record<string, string> } = $props();

    let sidebar: GoalEditorSidebar;

    let goal = $state<Goal | undefined>(undefined);
    let goalVariable = $state<Variable | undefined>(undefined);
    let goalStreakVariable = $state<Variable | undefined>(undefined);
    let goalData = $state<GoalVariableType | null>(null);
    let goalStreakData = $state<GoalStreakVariableType | null>(null);

    let creating = $state<boolean>(false);

    async function newGoal() {
        creating = true;

        variableEditProvider.newEdit();
        let variable = variableEditProvider.createVariableFromType(VariableTypeName.GOAL);
        if (variable.type.type != VariableTypeName.GOAL) return;

        let streakVariable = variableEditProvider.createVariableFromType(VariableTypeName.GOAL_STREAK);
        if (streakVariable.type.type != VariableTypeName.GOAL_STREAK) return;

        streakVariable.type.value = new GoalStreakVariableType(variable.id, createDefaultWeekDays());

        goal = {
            id: crypto.randomUUID(),
            name: "New goal",
            color: "#ff0000",
            variableId: variable.id,
            streakVariableId: streakVariable.id,
        };

        goalVariable = variable;
        goalStreakVariable = streakVariable;
        goalStreakData = streakVariable.type.value;
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

        goalStreakVariable = variableEditProvider.getVariableById(goal.streakVariableId);
        if (goalStreakVariable == null) return;

        if (goalStreakVariable.type.type != VariableTypeName.GOAL_STREAK) return;

        goalData = goalVariable.type.value;
        goalStreakData = goalStreakVariable.type.value;
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
        if (goal == null || goalData == null || goalStreakData == null || goalVariable == null || goalStreakVariable == null) return;

        // @ts-ignore
        let variable: Variable = $state.snapshot<Variable>(goalVariable);
        variable.type.value = goalData;
        variable.name = goal.name;
        // @ts-ignore
        let streakVariable: Variable = $state.snapshot<Variable>(goalStreakVariable);
        streakVariable.type.value = goalStreakData;
        variableEditProvider.updateVariable(variable);
        variableEditProvider.updateVariable(streakVariable);
        await variableEditProvider.save();

        let goalSnapshot: Goal = $state.snapshot(goal);
        if (creating) {
            variable.name = goalSnapshot.name;
            await goals.createGoal(goalSnapshot.name, goalSnapshot.color, variable, streakVariable);
        } else {
            await goals.updateGoal(goalSnapshot);
        }

        navigate("/goals");
    }

    function updateTimeScope(value: TimeScope) {
        goalData = new GoalVariableType(goalData!.getConditions(), value);
    }

    function updateWeekDays(value: number[]) {
        goalStreakData = new GoalStreakVariableType(goalStreakData!.getGoalVariableId(), value);
    }

    function discard() {
        back();
    }

    function closeSidebar() {
        sidebar.close();
    }

    onMount(() => loadGoal());
</script>

<svelte:body onclick={closeSidebar}/>
<div class="center-view mx-auto md:mt-8 pb-10">
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
    {#if goal != null && goalData != null && goalStreakData != null}
        <div class="pb-32 main-content scrollbar-hide">
            <div class="md:w-1/2 md:p-0 p-4">
                <p class="block mb-2 label mt-4">Name & color</p>
                <div class="row-gap">
                    <input bind:value={goal.name} placeholder="Goal name" type="text" class="input">
                    <ColorPickerButton bind:value={goal.color}/>
                </div>

                <p class="block mb-2 label mt-4">Conditions</p>
                <div class="flex flex-col gap-2 mt-2 h-full">
                    {#each goalData.getConditions() as condition(condition.id)}
                        <GoalConditionCard goalId={goal.variableId}
                                           {condition}
                                           onOpenSidebar={openSidebar}
                                           onUpdate={(condition) => onConditionUpdate(condition)}
                                           onDelete={() => onConditionDelete(condition)}
                        />
                    {/each}
                    <button class="horizontal-add-button rounded-xl" onclick={addCondition}>
                        <Fa icon={faPlusCircle} class="pointer-events-none"/>
                    </button>
                </div>
            </div>
            <div class="inline-block px-4 md:px-0 w-full md:w-auto">
                <p class="block mb-2 label mt-4">Time scope</p>
                <TimeScopePicker value={goalData.getTimeScope()} onChange={updateTimeScope}/>
            </div>
            <div class="px-4 md:px-0">
                <div class="flex flex-col mb-2"><p class="block label mt-4">Streak week days</p>
                    <p class="text-xs">Unchecked days are off-days</p>
                </div>
                <WeekDays value={goalStreakData.getWeekDays()} onChange={updateWeekDays}/>
            </div>
        </div>
    {:else}
        <p>Goal not found</p>
    {/if}

    <div class="md:flex hidden items-center gap-2 mt-6">
        <Button onClick={save}>Save</Button>
        <Button onClick={discard} color={ButtonColor.RED}>Discard</Button>
    </div>
</div>
<GoalEditorSidebar bind:this={sidebar}/>
