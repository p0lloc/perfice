<script lang="ts">
    import {faBoxesStacked, faHamburger} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import EditTrackableCard from "@perfice/components/trackable/modals/edit/general/EditTrackableCard.svelte";
    import IconPickerButton from "@perfice/components/base/iconPicker/IconPickerButton.svelte";

    let {editState = $bindable()}: { editState: EditTrackableState } = $props();

    function onIconChange(icon: string) {
        editState.trackable.icon = icon;
    }
</script>

<div>
    <label for="first_name" class=" mb-2 label">Name & icon</label>
    <div class="row-gap w-full">
        <input id="first_name" bind:value={editState.trackable.name} placeholder="Trackable name" type="text"
               class="input flex-1">
        <IconPickerButton icon={editState.trackable.icon} onChange={onIconChange}/>
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
