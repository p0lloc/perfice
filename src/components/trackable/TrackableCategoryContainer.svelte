<script lang="ts">
    import {type CategoryList, UNCATEGORIZED_NAME} from "@perfice/util/category";
    import {type Trackable, type TrackableCategory} from "@perfice/model/trackable/trackable";
    import TrackableCard from "@perfice/components/trackable/card/TrackableCard.svelte";
    import {faGripVertical, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import {dragHandle} from "svelte-dnd-action";

    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";

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

    function onFinalize(items: Trackable[]) {
        onReorder(items);
    }

    let uncategorized = $derived(category.category == null);
</script>

<div class="group">
    <div class="text-3xl flex justify-between">
        <div class="row-gap">
            {#if !uncategorized}
                <span class="text-base text-gray-400" use:dragHandle aria-label="Drag handle for category">
                    <Fa icon={faGripVertical}/>
                </span>
            {/if}
            {category.category?.name ?? UNCATEGORIZED_NAME}
        </div>
        <div class="flex items-center md:group-hover:flex md:hidden text-xl text-gray-500">
            {#if !uncategorized}
                <IconButton icon={faTrash} onClick={onCategoryDelete}/>
            {/if}
            <IconButton icon={faPlus} onClick={createTrackable}/>
        </div>
    </div>
    <hr>
    <DragAndDropContainer items={category.items} onFinalize={onFinalize}
                          class="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 min-h-12">
        {#snippet item(trackable)}
            <TrackableCard {trackable} {date} {weekStart} onEdit={() => onEdit(trackable)}
                           onLog={() => onLog(trackable)}/>
        {/snippet}
    </DragAndDropContainer>
</div>
