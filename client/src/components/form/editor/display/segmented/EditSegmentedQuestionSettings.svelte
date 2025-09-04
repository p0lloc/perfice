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

    let {settings, onChange, dataType, dataSettings}: {
        settings: SegmentedFormQuestionSettings,
        onChange: (settings: SegmentedFormQuestionSettings) => void,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    let editOptionModal: EditSegmentedOptionModal;

    async function addOption() {
        let newOption = await editOptionModal.open(null);
        if (newOption == null) return;

        onChange({...settings, options: [...settings.options, newOption]});
    }

    async function onEditOption(option: SegmentedOption) {
        let updatedOption = await editOptionModal.open($state.snapshot(option));
        if (updatedOption == null) return;

        onChange({...settings, options: updateIdentifiedInArray(settings.options, updatedOption)});
    }

    function onDeleteOption(option: SegmentedOption) {
        onChange({...settings, options: deleteIdentifiedInArray(settings.options, option.id)});
    }

    function onReorderFinalize(items: SelectOption[]) {
        onChange({...settings, options: items});
    }
</script>

<EditSegmentedOptionModal bind:this={editOptionModal} {dataType} {dataSettings}/>
<div class="row-gap mt-4">
    <h2 class="text-xl text-gray-500 font-bold">Options</h2>
    <IconButton icon={faPlus} onClick={addOption}/>
</div>
<DragAndDropContainer zoneId="segmented-options"
                      onFinalize={onReorderFinalize} items={settings.options} class="flex flex-col gap-2 mt-2">
    {#snippet item(option)}
        <EditSegmentedOptionCard {option} onEdit={() => onEditOption(option)}
                                 onDelete={() => onDeleteOption(option)}/>
    {/snippet}
</DragAndDropContainer>