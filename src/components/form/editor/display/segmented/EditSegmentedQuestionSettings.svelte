<script lang="ts">
    import type {SegmentedFormQuestionSettings, SegmentedOption} from "@perfice/model/form/display/segmented";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {pString} from "@perfice/model/primitive/primitive";
    import EditSegmentedOptionCard from "@perfice/components/form/editor/display/segmented/EditSegmentedOptionCard.svelte";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import EditSegmentedOptionModal
        from "@perfice/components/form/editor/display/segmented/EditSegmentedOptionModal.svelte";

    let {settings = $bindable(), dataType, dataSettings}: {
        settings: SegmentedFormQuestionSettings,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    let editOptionModal: EditSegmentedOptionModal;

    async function addOption() {
        let newOption = await editOptionModal.open(null);
        if(newOption == null) return;

        settings.options.push(newOption);
    }

    async function onEditOption(option: SegmentedOption) {
        let updatedOption = await editOptionModal.open($state.snapshot(option));
        if(updatedOption == null) return;

        settings.options = updateIdentifiedInArray(settings.options, updatedOption);
    }

    function onDeleteOption(option: SegmentedOption) {
        settings.options = deleteIdentifiedInArray(settings.options, option.id);
    }
</script>

<EditSegmentedOptionModal bind:this={editOptionModal} {dataType} {dataSettings}/>
<div class="row-gap mt-4">
    <h2 class="text-xl text-gray-500 font-bold">Options</h2>
    <IconButton icon={faPlus} onClick={addOption}/>
</div>
<div class="flex flex-col gap-2 mt-2">
    {#each settings.options as option}
        <EditSegmentedOptionCard {option} onEdit={() => onEditOption(option)}
                                 onDelete={() => onDeleteOption(option)}/>
    {/each}
</div>
