<script lang="ts">
    import type {SelectFormQuestionSettings, SelectGrid, SelectOption} from "@perfice/model/form/display/select";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import EditSelectOptionCard from "@perfice/components/form/editor/display/select/EditSelectOptionCard.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import EditSelectOptionModal from "@perfice/components/form/editor/display/select/EditSelectOptionModal.svelte";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import EditSelectGrid from "@perfice/components/form/editor/display/select/EditSelectGrid.svelte";

    let {settings, onChange, dataType, dataSettings}: {
        settings: SelectFormQuestionSettings,
        onChange: (settings: SelectFormQuestionSettings) => void,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    let editOptionModal: EditSelectOptionModal;

    async function addOption() {
        let newOption = await editOptionModal.open(null);
        if (newOption == null) return;

        onChange({...settings, options: [...settings.options, newOption]});
    }

    async function onEditOption(option: SelectOption) {
        let updatedOption = await editOptionModal.open($state.snapshot(option));
        if (updatedOption == null) return;

        onChange({...settings, options: updateIdentifiedInArray(settings.options, updatedOption)});
    }

    function onDeleteOption(option: SelectOption) {
        onChange({...settings, options: deleteIdentifiedInArray(settings.options, option.id)});
    }

    function onReorderFinalize(items: SelectOption[]) {
        onChange({...settings, options: items});
    }

    function removeGrid() {
        onChange({...settings, grid: null});
    }

    function addGrid() {
        onChange({...settings, grid: {itemsPerRow: 1, border: true}});
    }

    function onMultipleChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...settings, multiple: e.currentTarget.checked});
    }

    function onGridChange(grid: SelectGrid) {
        onChange({...settings, grid});
    }
</script>

<EditSelectOptionModal bind:this={editOptionModal} {dataType} {dataSettings}/>
<div class="row-between">
    <h2 class="text-xl text-gray-500 font-bold">Multiple values</h2>
    <input type="checkbox" class="border w-4 h-4" checked={settings.multiple} onchange={onMultipleChange}/>
</div>
<div class="row-gap mt-4">
    <h2 class="text-xl text-gray-500 font-bold">Options</h2>
    <IconButton icon={faPlus} onClick={addOption}/>
</div>
<DragAndDropContainer zoneId="select-options" onFinalize={onReorderFinalize}
                      items={settings.options}
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
            <Button onClick={removeGrid}>Remove</Button>
        {:else}
            <Button onClick={addGrid}>Add grid</Button>
        {/if}
    </div>
    {#if settings.grid != null}
        <EditSelectGrid grid={settings.grid} onChange={onGridChange}/>
    {/if}
</div>
