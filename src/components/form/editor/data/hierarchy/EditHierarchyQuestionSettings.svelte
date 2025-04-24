<script lang="ts">
    import type {HierarchyFormQuestionDataSettings, HierarchyOption} from "@perfice/model/form/data/hierarchy";
    import EditHierarchyOption from "@perfice/components/form/editor/data/hierarchy/EditHierarchyOption.svelte";
    import EditHierarchyOptionModal
        from "@perfice/components/form/editor/data/hierarchy/EditHierarchyOptionModal.svelte";

    let editModal: EditHierarchyOptionModal;
    let {settings, onChange}: {
        settings: HierarchyFormQuestionDataSettings,
        onChange: (settings: HierarchyFormQuestionDataSettings) => void
    } = $props();

    function onEdit(option: HierarchyOption) {
        editModal.open(option);
    }

    function onRootChange(option: HierarchyOption) {
        onChange({...settings, root: option})
    }
</script>

<EditHierarchyOptionModal bind:this={editModal}/>
<EditHierarchyOption option={settings.root} onChange={onRootChange} root={true} {onEdit} onDelete={() => {}}/>

