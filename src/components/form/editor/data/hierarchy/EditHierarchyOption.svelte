<script lang="ts">
    import type {HierarchyOption} from "@perfice/model/form/data/hierarchy";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faFolderTree, faPen, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    import {deleteIdentifiedInArray, updateIndexInArray} from "@perfice/util/array";
    import EditHierarchyOption from "./EditHierarchyOption.svelte"
    import {pString} from "@perfice/model/primitive/primitive";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {option, onChange, root = false, onDelete, onEdit}: {
        option: HierarchyOption,
        onChange: (option: HierarchyOption) => void,
        root?: boolean,
        onDelete: (option: HierarchyOption) => void,
        onEdit: (option: HierarchyOption) => void
    } = $props();

    function onAddChild() {
        option.children.push({
            id: crypto.randomUUID(),
            text: "Option",
            value: pString("option"),
            children: [],
            gridSize: 2,
            color: "#ff8888"
        });
    }

    function onChildChange(index: number, child: HierarchyOption) {
        onChange({...option, children: updateIndexInArray(option.children, index, child)});
    }

    function onDeleteChild(child: HierarchyOption) {
        onChange({...option, children: deleteIdentifiedInArray(option.children, child.id)});
    }

</script>

<div class:ml-3={!root}>
    <div class="row-gap">
        <div class="row-gap overflow-hidden">
            <Fa icon={faFolderTree} class="text-gray-500"/>
            <span class="overflow-hidden text-ellipsis">{option.text}</span></div>
        <div class="flex">
            <IconButton class="text-gray-400" onClick={onAddChild} icon={faPlus}/>
            <IconButton class="text-gray-400" onClick={() => onEdit(option)} icon={faPen}/>
            {#if !root}
                <IconButton class="text-gray-400" onClick={() => onDelete(option)} icon={faTrash}/>
            {/if}
        </div>
    </div>
    {#each option.children as child, i}
        <EditHierarchyOption option={child} onChange={(v) => onChildChange(i, v)} {onEdit}
                             onDelete={onDeleteChild}/>
    {/each}
</div>