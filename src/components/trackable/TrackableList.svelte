<script lang="ts">
    import TrackableCategoryContainer from "@perfice/components/trackable/TrackableCategoryContainer.svelte";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
    import LineButton from "@perfice/components/base/button/LineButton.svelte";
    import type {CategoryList} from "@perfice/util/category";
    import {categorizedTrackables, trackableCategories, trackables} from "@perfice/stores";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";

    let {date, weekStart, onEdit, onLog, onCreate, onCategoryDelete}: {
        date: Date,
        weekStart: WeekStart,
        onCreate: (categoryId: string | null) => void,
        onEdit: (t: Trackable) => void,
        onLog: (t: Trackable) => void,
        onCategoryDelete: (category: TrackableCategory) => void
    } = $props();

    function onReorder(category: CategoryList<TrackableCategory, Trackable>, items: Trackable[]) {
        trackables.reorderTrackables(category.category, items);
    }

    function addCategory() {
        trackableCategories.createCategory(prompt("Name") ?? "");
    }

    type ReorderableCategoryList = CategoryList<TrackableCategory, Trackable> & {
        id: string | null;
    };

    function filterAvailableCategories(categories: CategoryList<TrackableCategory, Trackable>[]): ReorderableCategoryList[] {
        return categories
            .filter(category => category.category != null || category.items.length > 0)
            .map(category => {
                return {
                    ...category,
                    id: category.category?.id ?? null
                };
            });
    }

    function onCategoriesReorder(list: ReorderableCategoryList[]) {
        trackableCategories.reorderCategories(list
            .filter(l => l.category != null)
            .map(l => l.category!));
    }
</script>

{#await $categorizedTrackables}
    Loading...
{:then categories}
    <div class="flex flex-col">
        <DragAndDropContainer onFinalize={onCategoriesReorder} items={filterAvailableCategories(categories)}
                              dragHandles={true}
                              zoneId="trackable-categories"
                              class="flex flex-col gap-8">
            {#snippet item(option)}
                <TrackableCategoryContainer {date} category={option} {weekStart}
                                            {onEdit} {onLog} {onCreate}
                                            onCategoryDelete={() => onCategoryDelete(option.category)}
                                            onReorder={(items) => onReorder(option, items)}/>
            {/snippet}
        </DragAndDropContainer>
        <LineButton onClick={addCategory}/>
    </div>
{/await}

