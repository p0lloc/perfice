<script lang="ts">
    import {faBoxesStacked, faHamburger} from "@fortawesome/free-solid-svg-icons";

    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import EditTrackableCard from "@perfice/components/trackable/modals/edit/EditTrackableCard.svelte";

    let {editState = $bindable()}: { editState: EditTrackableState } = $props();

</script>

<div>
    <label for="first_name" class=" mb-2 label">Name & icon</label>
    <div class="row-gap">
        <input id="first_name" bind:value={editState.trackable.name} placeholder="Trackable name" type="text"
               class="input">
        <button class="min-w-10 bg-gray-50 border-gray-300 border min-h-10 flex justify-center items-center icon-button">
            <Fa icon={faHamburger}/>
        </button>
    </div>
    <div class="row-between mt-4">
        <div class="row-gap label">
            <Fa icon={faBoxesStacked}/>
            <label for="first_name">Category</label>
        </div>
        <select class="">
            <option>Lifestyle</option>
        </select>
    </div>

    <EditTrackableCard bind:cardState={editState.cardState} availableQuestions={editState.form.questions}/>
</div>
