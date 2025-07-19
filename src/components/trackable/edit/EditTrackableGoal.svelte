<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import TimeScopePicker from "@perfice/components/base/timeScope/TimeScopePicker.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {TimeScope} from "@perfice/model/variable/time/time";
    import {trackables, variableEditProvider} from "@perfice/stores";

    let {editState, close}: { editState: EditTrackableState, close: () => void } = $props();

    function updateTimeScope(v: TimeScope) {
    }

    async function create() {
        editState.goalVariableData = await trackables.createTrackableGoalInEditState(editState.trackable);
    }

    export async function save() {
        await variableEditProvider.save();
    }
</script>

{#if editState.goalVariableData != null}
    <DropdownButton value="ok" items={[
    {
        name: "ok",
        value: "ok"
    }
]}/>
    <DropdownButton value="ok" items={[
    {
        name: "greater than",
        value: "ok"
    }
]}/>
    <DropdownButton value="ok" items={[
    {
        name: "10 min",
        value: "ok"
    }
]}/>
    <div class="inline-block px-4 md:px-0 w-full md:w-auto">
        <p class="block mb-2 label mt-4">Time scope</p>
        <TimeScopePicker value={editState.goalVariableData.getTimeScope()} onChange={updateTimeScope}/>
    </div>
{:else}
    <div class="flex justify-center items-center">
        <button onclick={create} class="flex items-center justify-center border rounded-xl w-16 h-16 hover-feedback">
            <Fa icon={faPlus}/>
        </button>
    </div>
{/if}
