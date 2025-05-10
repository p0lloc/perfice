<script lang="ts">
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import {onMount} from "svelte";
    import type {Tag, TagCategory} from "@perfice/model/tag/tag";
    import TagCategoryContainer from "@perfice/components/tag/TagCategoryContainer.svelte";
    import {faTags} from "@fortawesome/free-solid-svg-icons";
    import {dateToMidnight} from "@perfice/util/time/simple";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import EditTagModal from "@perfice/components/tag/modal/EditTagModal.svelte";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import {categorizedTags, tagCategories, tagDate, tags, weekStart} from "@perfice/stores";
    import type {CategoryList} from "@perfice/util/category";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import InlineCreateLineButton from "@perfice/components/base/inline/InlineCreateLineButton.svelte";

    let editTagModal: EditTagModal;
    let deleteTagModal: GenericDeleteModal<Tag>;
    let deleteTagCategoryModal: GenericDeleteModal<TagCategory>;

    function onDateChange(e: Date) {
        $tagDate = e;
    }

    function onTagClicked(tag: Tag, entryToDelete: string | null) {
        if (entryToDelete == null) {
            tags.logTag(tag.id, $tagDate);
        } else {
            tags.unlogTagEntry(entryToDelete);
        }
    }

    function createCategory(name: string) {
        tagCategories.createCategory(name);
    }

    function onTagEdit(tag: Tag) {
        editTagModal.open(tag);
    }

    function onTagSaved(tag: Tag) {
        tags.updateTag($state.snapshot(tag));
    }

    function onStartTagDelete(tag: Tag) {
        deleteTagModal.open(tag);
    }

    function onTagDeleted(tag: Tag) {
        tags.deleteTag(tag);
    }

    function onTagCategoryDeleted(tagCategory: TagCategory) {
        tagCategories.deleteCategoryById(tagCategory.id);
    }

    function onTagsReorder(items: Tag[], category: TagCategory | null) {
        tags.reorderTags(items, category);
    }

    function onStartTagCategoryDelete(category: TagCategory | null) {
        if (category == null) return;

        deleteTagCategoryModal.open(category);
    }

    type ReorderableCategoryList = CategoryList<TagCategory, Tag> & {
        id: string | null;
    };

    function onCategoriesReorder(list: ReorderableCategoryList[]) {
        tagCategories.reorderCategories(list
            .filter(l => l.category != null)
            .map(l => l.category!));
    }

    function filterAvailableCategories(categories: CategoryList<TagCategory, Tag>[]): ReorderableCategoryList[] {
        return categories
            .filter(category => category.category != null || category.items.length > 0)
            .map(category => {
                return {
                    ...category,
                    id: category.category?.id ?? null
                };
            });
    }

    onMount(() => {
        tagCategories.load();
        tags.load();
    });

    tagDate.set(dateToMidnight(new Date()));

</script>

<MobileTopBar title="Tags"/>
{#await $tagCategories then categories}
    <EditTagModal bind:this={editTagModal} onSave={onTagSaved} onDelete={onStartTagDelete} categories={categories}/>
{/await}

<GenericDeleteModal bind:this={deleteTagModal} onDelete={onTagDeleted} subject="this tag"/>
<GenericDeleteModal bind:this={deleteTagCategoryModal} onDelete={onTagCategoryDeleted}
                    subject="this category and all associated tags"/>

<div class="mx-auto w-screen main-content center-view md:px-0 px-4 md:py-10 py-2">
    <TitleAndCalendar
            date={$tagDate}
            {onDateChange}
            title="Tags"
            icon={faTags}
    />


    <div class="flex flex-col gap-8">
        {#await $categorizedTags}
            Loading...
        {:then categories}

            <div class="flex flex-col">
                <DragAndDropContainer onFinalize={onCategoriesReorder} items={filterAvailableCategories(categories)}
                                      dragHandles={true}
                                      zoneId="tag-categories"
                                      class="flex flex-col gap-8">
                    {#snippet item(category)}
                        <TagCategoryContainer
                                date={$tagDate}
                                {category}
                                weekStart={$weekStart}
                                onTagEdit={(t) => onTagEdit(t)}
                                onDelete={() => onStartTagCategoryDelete(category.category)}
                                onReorder={(t) => onTagsReorder(t, category.category)}
                                onTagClicked={(t, entryId) => onTagClicked(t, entryId)}/>
                    {/snippet}
                </DragAndDropContainer>
                <InlineCreateLineButton onSubmit={(name) => createCategory(name)}/>
            </div>
            <!--{#each categories as category (category.category?.id)}-->
            <!--    {#if category.items.length > 0 || categories.flatMap(c => c.items).length === 0}-->
            <!--        <TagCategoryContainer-->
            <!--                date={$tagDate}-->
            <!--                {category}-->
            <!--                weekStart={$weekStart}-->
            <!--                onTagEdit={(t) => onTagEdit(t)}-->
            <!--                onDelete={() => onStartTagCategoryDelete(category.category)}-->
            <!--                onReorder={onTagsReorder}-->
            <!--                onTagClicked={(t, entryId) => onTagClicked(t, entryId)}-->
            <!--        />-->
            <!--    {/if}-->
            <!--{/each}-->
            <!--<LineButton onClick={addCategory}/>-->
        {/await}
    </div>
</div>
