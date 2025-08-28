<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {trackables} from "@perfice/stores";
    import NumberGoalEditor from "@perfice/components/goal/editor/number/NumberGoalEditor.svelte";
    import {GoalVariableType} from "@perfice/services/variable/types/goal";

    let {editState}: { editState: EditTrackableState, close: () => void } = $props();

    async function create() {
        let goalVariable = await trackables.createTrackableGoalInEditState(editState.trackable);
        if (goalVariable == null) return;
        editState.goalVariable = goalVariable;
        editState.goalVariableData = goalVariable.type.value as GoalVariableType;
    }

    function onGoalChange(v: GoalVariableType) {
        editState.goalVariableData = v;
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
