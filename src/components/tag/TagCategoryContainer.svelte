<script lang="ts">
    import {faCheck, faPen, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {type CategoryList, UNCATEGORIZED_NAME} from "@perfice/util/category";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import type {Tag, TagCategory} from "@perfice/model/tag/tag";
    import TagValueCard from "@perfice/components/tag/TagValueCard.svelte";
    import {tags} from "@perfice/app";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";

    let {category, date, weekStart, onTagClicked, onTagEdit, onDelete}: {
        category: CategoryList<TagCategory, Tag>,
        date: Date,
        weekStart: WeekStart,
        onTagClicked: (t: Tag, entryId: string | null) => void
        onTagEdit: (t: Tag) => void,
        onDelete: () => void
    } = $props();

    let editing = $state(false);

    function toggleEdit() {
        editing = !editing;
    }

    async function createTag() {
        await tags.createTag(prompt("Name") ?? "", category.category?.id ?? null);
    }

    function onTagClick(tag: Tag, entryId: string | null) {
        if (!editing) {
            onTagClicked(tag, entryId);
        } else {
            onTagEdit(tag);
        }
    }
</script>

<div>
    <h1 class="text-3xl flex justify-between">
        {category.category?.name ?? UNCATEGORIZED_NAME}
        <div class="flex">
            {#if editing && category.category != null}
                <IconButton class="text-xl" icon={faTrash} onClick={onDelete}/>
            {/if}
            <IconButton class="text-xl" icon={editing ? faCheck : faPen} onClick={toggleEdit}/>
            <IconButton class="text-2xl" icon={faPlus} onClick={createTag}/>
        </div>
    </h1>
    <hr>
    <div class="w-full mt-4 flex flex-wrap gap-2 md:gap-2">
        {#each category.items as tag}
            <TagValueCard {editing} tag={tag} onClick={(log) => onTagClick(tag, log)} date={date}
                          weekStart={weekStart}/>
        {/each}
    </div>
</div>
