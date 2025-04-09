<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import EditTrackableCard from "@perfice/components/trackable/modals/edit/general/EditTrackableCard.svelte";
    import IconPickerButton from "@perfice/components/base/iconPicker/IconPickerButton.svelte";
    import EditTrackableCategory from "@perfice/components/trackable/modals/edit/general/EditTrackableCategory.svelte";

    let {editState = $bindable()}: { editState: EditTrackableState } = $props();

    function onIconChange(icon: string) {
        editState.trackable.icon = icon;
    }

    function onCategoryChange(categoryId: string | null) {
        editState.trackable.categoryId = categoryId;
    }
</script>

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
</div>
