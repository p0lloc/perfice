<script lang="ts">
    import type {SelectFormQuestionSettings, SelectGrid, SelectOption} from "@perfice/model/form/display/select";
    import Button from "@perfice/components/base/button/Button.svelte";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import EditSelectOptionModal from "@perfice/components/form/editor/display/select/EditSelectOptionModal.svelte";
    import EditSelectGrid from "@perfice/components/form/editor/display/select/EditSelectGrid.svelte";
    import DndOptionList from "@perfice/components/form/editor/DndOptionList.svelte";

    let {settings, onChange, dataType, dataSettings}: {
        settings: SelectFormQuestionSettings,
        onChange: (settings: SelectFormQuestionSettings) => void,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    let editOptionModal: EditSelectOptionModal;

    async function onOptionAdd() {
        let newOption = await editOptionModal.open(null);
        if (newOption == null) return;

        onChange({...settings, options: [...settings.options, newOption]});
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

    function onOptionsChange(options: SelectOption[]) {
        onChange({...settings, options});
    }

    function onOptionEdit(option: SelectOption) {
        return editOptionModal.open($state.snapshot(option));
    }

    function onGridChange(grid: SelectGrid) {
        onChange({...settings, grid});
    }
</script>

<EditSelectOptionModal bind:this={editOptionModal} {dataType} {dataSettings}/>
<div class="row-between">
    <h2 class="text-xl text-gray-500 dark:text-white font-bold">Multiple values</h2>
    <input type="checkbox" class="border w-4 h-4" checked={settings.multiple} onchange={onMultipleChange}/>
</div>

<div class="mt-4">
    <DndOptionList label="Options" options={settings.options} text={(option) => option.text} onChange={onOptionsChange}
                   onEdit={onOptionEdit}
                   onAdd={onOptionAdd}/>
</div>

<div class="mt-4">
    <div class="row-between">
        <h2 class="text-xl text-gray-500 dark:text-white font-bold">Grid</h2>
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
