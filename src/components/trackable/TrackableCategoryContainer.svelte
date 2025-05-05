<script lang="ts">
    import {type CategoryList} from "@perfice/util/category";
    import {type Trackable, type TrackableCategory} from "@perfice/model/trackable/trackable";
    import TrackableCard from "@perfice/components/trackable/card/TrackableCard.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import GenericCategoryContainer from "@perfice/components/base/category/GenericCategoryContainer.svelte";

    let {category, date, weekStart, onReorder, onEdit, onLog, onCreate, onCategoryDelete}: {
        category: CategoryList<TrackableCategory, Trackable>,
        date: Date,
        weekStart: WeekStart,
        onCategoryDelete: () => void,
        onReorder: (items: Trackable[]) => void,
        onCreate: (categoryId: string | null) => void,
        onEdit: (t: Trackable) => void
        onLog: (t: Trackable) => void
    } = $props();

    async function createTrackable() {
        onCreate(category.category?.id ?? null);
    }

    // function onFinalize(items: Trackable[]) {
    //     onReorder(items);
    // }
    //
    // let uncategorized = $derived(category.category == null);
</script>
<!--<div class="group" >-->
<!--    <CategoryContainerHeader {category} {onCategoryDelete} onEntityCreate={createTrackable} getName={(v) => v.name}/>-->
<!--    <hr>-->
<!--    <DragAndDropContainer items={category.items} onFinalize={onFinalize}-->
<!--                          class="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 min-h-12">-->
<!--        {#snippet item(trackable)}-->
<!--            <TrackableCard {trackable} {date} {weekStart} onEdit={() => onEdit(trackable)}-->
<!--                           onLog={() => onLog(trackable)}/>-->
<!--        {/snippet}-->
<!--    </DragAndDropContainer>-->
<!--</div>-->

<GenericCategoryContainer {onReorder} {category} {onCategoryDelete} onEntityCreate={createTrackable}
                          getName={(v) => v.name}
                          class="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 min-h-12">
    {#snippet entity(trackable)}
        <TrackableCard {trackable} {date} {weekStart} onEdit={() => onEdit(trackable)}
                       onLog={() => onLog(trackable)}/>
    {/snippet}
</GenericCategoryContainer>