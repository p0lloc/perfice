<script lang="ts">
    import type {SelectFormQuestionSettings, SelectOption} from "@perfice/model/form/display/select";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import EditSelectOptionCard from "@perfice/components/form/editor/display/select/EditSelectOptionCard.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import EditSelectOptionModal from "@perfice/components/form/editor/display/select/EditSelectOptionModal.svelte";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";

    let {settings = $bindable(), dataType, dataSettings}: {
        settings: SelectFormQuestionSettings,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    let editOptionModal: EditSelectOptionModal;
    let dragContainer: DragAndDropContainer;

    async function addOption() {
        let newOption = await editOptionModal.open(null);
        if (newOption == null) return;

        settings.options.push(newOption);
        dragContainer.invalidateItems();
    }

    async function onEditOption(option: SelectOption) {
        let updatedOption = await editOptionModal.open($state.snapshot(option));
        if (updatedOption == null) return;

        settings.options = updateIdentifiedInArray(settings.options, updatedOption);
        dragContainer.invalidateItems();
    }

    function onReorderFinalize(items: SelectOption[]) {
        settings.options = items;
    }

    function onDeleteOption(option: SelectOption) {
        settings.options = deleteIdentifiedInArray(settings.options, option.id);
        dragContainer.invalidateItems();
    }
</script>

<EditSelectOptionModal bind:this={editOptionModal} {dataType} {dataSettings}/>
<div class="row-between">
    <h2 class="text-xl text-gray-500 font-bold">Multiple values</h2>
    <input type="checkbox" class="border w-4 h-4" bind:checked={settings.multiple}/>
</div>
<div class="row-gap mt-4">
    <h2 class="text-xl text-gray-500 font-bold">Options</h2>
    <IconButton icon={faPlus} onClick={addOption}/>
</div>
<DragAndDropContainer bind:this={dragContainer} onFinalize={onReorderFinalize} items={settings.options}
                      class="flex flex-col gap-2 mt-2">
    {#snippet item(option)}
        <EditSelectOptionCard {option} onEdit={() => onEditOption(option)}
                              onDelete={() => onDeleteOption(option)}/>
    {/snippet}
</DragAndDropContainer>
<div class="mt-4">
    <div class="row-between">
        <h2 class="text-xl text-gray-500 font-bold">Grid</h2>
        {#if settings.grid != null}
            <Button onClick={() => settings.grid = null}>Remove</Button>
        {:else}
            <Button onClick={() => settings.grid = {itemsPerRow: 1, border: true}}>Add grid</Button>
        {/if}
    </div>
    {#if settings.grid != null}
        <div class="mt-2 flex flex-col gap-2">
            <div class="row-between">
                <p>Items per row</p>
                <input type="number" class="border w-1/2" bind:value={settings.grid.itemsPerRow}/>
            </div>
            <div class="row-between">
                <p>Border</p>
                <input type="checkbox" class="border" bind:checked={settings.grid.border}/>
            </div>
        </div>
    {/if}
</div>
