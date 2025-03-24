<script lang="ts">
    import type {SegmentedFormQuestionSettings, SegmentedOption} from "@perfice/model/form/display/segmented";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import EditSegmentedOptionCard
        from "@perfice/components/form/editor/display/segmented/EditSegmentedOptionCard.svelte";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import EditSegmentedOptionModal
        from "@perfice/components/form/editor/display/segmented/EditSegmentedOptionModal.svelte";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import type {SelectOption} from "@perfice/model/form/display/select";

    let {settings = $bindable(), dataType, dataSettings}: {
        settings: SegmentedFormQuestionSettings,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    let editOptionModal: EditSegmentedOptionModal;
    let dragContainer: DragAndDropContainer;

    async function addOption() {
        let newOption = await editOptionModal.open(null);
        if (newOption == null) return;

        settings.options.push(newOption);
        dragContainer.invalidateItems();
    }

    async function onEditOption(option: SegmentedOption) {
        let updatedOption = await editOptionModal.open($state.snapshot(option));
        if (updatedOption == null) return;

        settings.options = updateIdentifiedInArray(settings.options, updatedOption);
        dragContainer.invalidateItems();
    }

    function onDeleteOption(option: SegmentedOption) {
        settings.options = deleteIdentifiedInArray(settings.options, option.id);
        dragContainer.invalidateItems();
    }

    function onReorderFinalize(items: SelectOption[]) {
        settings.options = items;
    }
</script>

<EditSegmentedOptionModal bind:this={editOptionModal} {dataType} {dataSettings}/>
<div class="row-gap mt-4">
    <h2 class="text-xl text-gray-500 font-bold">Options</h2>
    <IconButton icon={faPlus} onClick={addOption}/>
</div>
<DragAndDropContainer zoneId="segmented-options" bind:this={dragContainer}
                      onFinalize={onReorderFinalize} items={settings.options} class="flex flex-col gap-2 mt-2">
    {#snippet item(option)}
        <EditSegmentedOptionCard {option} onEdit={() => onEditOption(option)}
                                 onDelete={() => onDeleteOption(option)}/>
    {/snippet}
</DragAndDropContainer>