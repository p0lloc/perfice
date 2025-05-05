<script lang="ts" generics="C, T">
    import {type CategoryList, UNCATEGORIZED_NAME} from "@perfice/util/category";
    import {faGripVertical, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    import {dragHandle} from "svelte-dnd-action";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {Snippet} from "svelte";

    let {category, onCategoryDelete, onEntityCreate, getName, actions}: {
        category: CategoryList<C, T>,
        onEntityCreate: () => void,
        onCategoryDelete: () => void,
        actions?: Snippet,
        getName: (t: C) => string
    } = $props();

    let uncategorized = $derived(category.category == null);
</script>
<div class="text-2xl md:text-3xl flex justify-between">
    <div class="row-gap">
        {#if !uncategorized}
            <span class="text-base text-gray-400" use:dragHandle aria-label="Drag handle for category">
                <Fa icon={faGripVertical}/>
            </span>
        {/if}
        {category.category != null ? getName(category.category) : UNCATEGORIZED_NAME}
    </div>
    <div class="flex items-center md:group-hover:flex md:hidden text-lg md:text-xl text-gray-500">
        {@render actions?.()}
        {#if !uncategorized}
            <IconButton icon={faTrash} onClick={onCategoryDelete}/>
        {/if}
        <IconButton icon={faPlus} onClick={onEntityCreate}/>
    </div>
</div>
