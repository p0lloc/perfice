<script lang="ts">
    import {categorizedTrackables, trackableCategories, trackables} from "@perfice/app";
    import TrackableCategoryContainer from "@perfice/components/trackable/TrackableCategoryContainer.svelte";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
    import LineButton from "@perfice/components/base/button/LineButton.svelte";
    import type {CategoryList} from "@perfice/util/category";

    let {date, weekStart, onEdit, onLog}: {
        date: Date,
        weekStart: WeekStart,
        onEdit: (t: Trackable) => void,
        onLog: (t: Trackable) => void
    } = $props();

    function onReorder(category: CategoryList<TrackableCategory, Trackable>, items: Trackable[]) {
        trackables.reorderTrackables(category.category, items);
    }

    function addCategory() {
        trackableCategories.createCategory(prompt("Name") ?? "");
    }
</script>

{#await $categorizedTrackables}
    Loading...
{:then categories}
    <div class="flex flex-col gap-8">
        {#each categories as category (category.category?.id)}
            {#if category.items.length > 0 || (categories.length > 0 && categories[0].items.length === 0)}
                <TrackableCategoryContainer {date} category={category} {weekStart}
                                            {onEdit} {onLog}
                                            onReorder={(items) => onReorder(category, items)}/>
            {/if}
        {/each}
        <LineButton onClick={addCategory}/>
    </div>
{/await}

