<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {HierarchyFormQuestionDataSettings, HierarchyOption} from "@perfice/model/form/data/hierarchy";
    import EditHierarchyOption from "@perfice/components/form/editor/data/hierarchy/EditHierarchyOption.svelte";
    import EditHierarchyOptionModal
        from "@perfice/components/form/editor/data/hierarchy/EditHierarchyOptionModal.svelte";

    let editModal: EditHierarchyOptionModal;
    let {settings = $bindable()}: { settings: HierarchyFormQuestionDataSettings } = $props();

    function onEdit(option: HierarchyOption) {
        editModal.open(option);
    }
</script>

<EditHierarchyOptionModal bind:this={editModal}/>
<EditHierarchyOption bind:option={settings.root} root={true} {onEdit} onDelete={() => {}}/>

