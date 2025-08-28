<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import EditTrackableCard from "@perfice/components/trackable/edit/general/EditTrackableCard.svelte";
    import IconPickerButton from "@perfice/components/base/iconPicker/IconPickerButton.svelte";
    import EditTrackableCategory from "@perfice/components/trackable/edit/general/EditTrackableCategory.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import {trackables} from "@perfice/stores";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {back} from "@perfice/app";

    let {editState = $bindable()}: { editState: EditTrackableState } = $props();

    let deleteModal: GenericDeleteModal<Trackable>;

    function onStartDelete() {
        deleteModal.open(editState.trackable);
    }

    async function onDelete() {
        await trackables.deleteTrackable(editState.trackable);
        await back();
    }

    function onIconChange(icon: string) {
        editState.trackable.icon = icon;
    }

    function onCategoryChange(categoryId: string | null) {
        editState.trackable.categoryId = categoryId;
    }
</script>

<GenericDeleteModal subject="this trackable" onDelete={onDelete} bind:this={deleteModal}/>
<div>
    <p class="mb-2 label">Name & icon</p>
    <div class="row-gap w-full">
        <input id="first_name" bind:value={editState.trackable.name} placeholder="Trackable name" type="text"
               class="input flex-1">
        <IconPickerButton right={true} icon={editState.trackable.icon} onChange={onIconChange}/>
    </div>

    <EditTrackableCategory categories={editState.categories} categoryId={editState.trackable.categoryId}
                           onChange={onCategoryChange}/>

    <EditTrackableCard bind:editState availableQuestions={editState.form.questions}/>

    <div class="mt-14 flex justify-start">
        <Button class="w-full md:w-auto" color={ButtonColor.RED} onClick={onStartDelete}>Delete trackable</Button>
    </div>
</div>
