<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {TimeScope} from "@perfice/model/variable/time/time";
    import {trackables, variableEditProvider} from "@perfice/stores";
    import NumberGoalEditor from "@perfice/components/goal/editor/number/NumberGoalEditor.svelte";
    import {GoalVariableType} from "@perfice/services/variable/types/goal";
    import {VariableTypeName} from "@perfice/model/variable/variable";

    let {editState, close}: { editState: EditTrackableState, close: () => void } = $props();

    function updateTimeScope(v: TimeScope) {
    }

    async function create() {
        let goalVariable = await trackables.createTrackableGoalInEditState(editState.trackable);
        if (goalVariable == null) return;
        editState.goalVariable = goalVariable;
        editState.goalVariableData = goalVariable.type.value as GoalVariableType;
    }

    function onGoalChange(v: GoalVariableType) {
        editState.goalVariableData = v;
    }

    export async function save() {
        if (editState.goalVariable == null || editState.goalVariableData == null) return;

        variableEditProvider.updateVariable({
            ...$state.snapshot(editState.goalVariable),
            type: {
                type: VariableTypeName.GOAL,
                value: new GoalVariableType(editState.goalVariableData.getConditions(), editState.goalVariableData.getTimeScope())
            }
        });
        await variableEditProvider.save();
    }
</script>

{#if editState.goalVariableData != null}
    <NumberGoalEditor data={editState.goalVariableData} form={editState.form} onChange={onGoalChange}/>
{:else}
    <div class="flex justify-center items-center">
        <button onclick={create} class="flex items-center justify-center border rounded-xl w-16 h-16 hover-feedback">
            <Fa icon={faPlus}/>
        </button>
    </div>
{/if}
