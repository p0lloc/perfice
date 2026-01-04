<script lang="ts">
    import type {SegmentedFormQuestionSettings, SegmentedOption} from "@perfice/model/form/display/segmented";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import EditSegmentedOptionModal
        from "@perfice/components/form/editor/display/segmented/EditSegmentedOptionModal.svelte";
    import DndOptionList from "@perfice/components/form/editor/DndOptionList.svelte";

    let {settings, onChange, dataType, dataSettings}: {
        settings: SegmentedFormQuestionSettings,
        onChange: (settings: SegmentedFormQuestionSettings) => void,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    let editOptionModal: EditSegmentedOptionModal;

    async function onOptionAdd() {
        let newOption = await editOptionModal.open(null);
        if (newOption == null) return;

        onOptionsChange([...settings.options, newOption]);
    }

    function onOptionsChange(options: SegmentedOption[]) {
        onChange({...settings, options});
    }

    function onOptionEdit(option: SegmentedOption) {
        return editOptionModal.open($state.snapshot(option));
    }
</script>

<EditSegmentedOptionModal bind:this={editOptionModal} {dataType} {dataSettings}/>
<DndOptionList label="Options" options={settings.options} text={(option) => option.text} onChange={onOptionsChange}
               onEdit={onOptionEdit}
               onAdd={onOptionAdd}/>