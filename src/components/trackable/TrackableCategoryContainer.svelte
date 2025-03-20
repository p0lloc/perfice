<script lang="ts">
    import {type CategoryList, UNCATEGORIZED_NAME} from "@perfice/util/category";
    import {type Trackable, type TrackableCategory} from "@perfice/model/trackable/trackable";
    import TrackableCard from "@perfice/components/trackable/card/TrackableCard.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {trackables} from "@perfice/main";
    import type {WeekStart} from "@perfice/model/variable/time/time";

    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";

    let {category, date, weekStart, onReorder, onEdit, onLog}: {
        category: CategoryList<TrackableCategory, Trackable>,
        date: Date,
        weekStart: WeekStart,
        onReorder: (items: Trackable[]) => void,
        onEdit: (t: Trackable) => void
        onLog: (t: Trackable) => void
    } = $props();

    async function createTrackable() {
        await trackables.createTrackable(prompt("Name?") ?? "", category.category?.id ?? null);
    }

    function onFinalize(items: Trackable[]) {
        onReorder(items);
    }
</script>

<div>
    <h1 class="text-3xl flex justify-between">
        {category.category?.name ?? UNCATEGORIZED_NAME}
        <button onclick={createTrackable}>
            <Fa icon={faPlus}/>
        </button>
    </h1>
    <hr>
    <DragAndDropContainer items={category.items} onFinalize={onFinalize}
                          class="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 min-h-12">
        {#snippet item(trackable)}
            <TrackableCard {trackable} {date} {weekStart} onEdit={() => onEdit(trackable)}
                           onLog={() => onLog(trackable)}/>
        {/snippet}
    </DragAndDropContainer>
</div>
