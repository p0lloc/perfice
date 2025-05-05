<script lang="ts">
    import {type CategoryList} from "@perfice/util/category";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import type {Tag, TagCategory} from "@perfice/model/tag/tag";
    import TagValueCard from "@perfice/components/tag/TagValueCard.svelte";
    import {tags} from "@perfice/stores";
    import GenericCategoryContainer from "@perfice/components/base/category/GenericCategoryContainer.svelte";
    import InlineCreateInput from "@perfice/components/base/inline/InlineCreateInput.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faCheck, faPen} from "@fortawesome/free-solid-svg-icons";

    let {category, date, weekStart, onTagClicked, onTagEdit, onDelete, onReorder}: {
        category: CategoryList<TagCategory, Tag>,
        date: Date,
        weekStart: WeekStart,
        onTagClicked: (t: Tag, entryId: string | null) => void
        onTagEdit: (t: Tag) => void,
        onDelete: () => void,
        onReorder: (items: Tag[]) => void
    } = $props();

    let editing = $state(false);
    let creatingTag = $state(false);

    function toggleEdit() {
        editing = !editing;
    }

    function startCreateTag() {
        creatingTag = true;
    }

    async function createTag(name: string) {
        await tags.createTag(name, category.category?.id ?? null);
    }

    function onTagClick(tag: Tag, entryId: string | null) {
        if (!editing) {
            onTagClicked(tag, entryId);
        } else {
            onTagEdit(tag);
        }
    }
</script>


<GenericCategoryContainer {onReorder} {category} onCategoryDelete={onDelete} onEntityCreate={startCreateTag}
                          getName={(v) => v.name}
                          extraClass="flex flex-wrap gap-2"
                          class="w-full flex flex-wrap gap-2 md:gap-2">
    {#snippet entity(tag)}
        <TagValueCard {editing} tag={tag} onClick={(log) => onTagClick(tag, log)} date={date}
                      weekStart={weekStart}/>
    {/snippet}
    {#snippet actions()}
        <IconButton class="text-xl" icon={editing ? faCheck : faPen} onClick={toggleEdit}/>
    {/snippet}
    {#snippet extra()}
        {#if creatingTag}
            <InlineCreateInput onBlur={() => creatingTag = false} onSubmit={(name) => createTag(name)}/>
        {/if}
    {/snippet}
</GenericCategoryContainer>

<!--<div>-->
<!--    <h1 class="text-3xl flex justify-between">-->
<!--        {category.category?.name ?? UNCATEGORIZED_NAME}-->
<!--        <div class="flex">-->
<!--            {#if editing && category.category != null}-->
<!--                <IconButton class="text-xl" icon={faTrash} onClick={onDelete}/>-->
<!--            {/if}-->
<!--            <IconButton class="text-xl" icon={editing ? faCheck : faPen} onClick={toggleEdit}/>-->
<!--            <IconButton class="text-2xl" icon={faPlus} onClick={startCreateTag}/>-->
<!--        </div>-->
<!--    </h1>-->
<!--    <hr>-->
<!--    <div class="w-full mt-4 flex flex-wrap gap-2 md:gap-2">-->
<!--        {#each category.items as tag}-->
<!--            <TagValueCard {editing} tag={tag} onClick={(log) => onTagClick(tag, log)} date={date}-->
<!--                          weekStart={weekStart}/>-->
<!--        {/each}-->
<!--        {#if creatingTag}-->
<!--            <InlineCreateInput onBlur={() => creatingTag = false} onSubmit={(name) => createTag(name)}/>-->
<!--        {/if}-->
<!--    </div>-->
<!--</div>-->
