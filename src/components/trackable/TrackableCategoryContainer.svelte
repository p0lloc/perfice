<script lang="ts">
    import type {CategoryList} from "@perfice/util/category";
    import {type Trackable, TrackableCardType, type TrackableCategory} from "@perfice/model/trackable/trackable";
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
        let trackableId = crypto.randomUUID();
        // TODO: move logic to trackable service
        await trackables.createTrackable({
            id: trackableId,
            name: "testing",
            icon: "",
            order: (await trackables.get()).length,
            formId: trackableId,
            categoryId: category.category?.id ?? null,
            cardType: TrackableCardType.CHART,
            cardSettings: {
                color: "#ff0000",
            },
            dependencies: {}
        })
    }

    function onFinalize(items: Trackable[]) {
        onReorder(items);
    }
</script>

<div>
    <h1 class="text-3xl flex justify-between">
        {category.category?.name ?? "Uncategorized"}
        <button onclick={createTrackable}>
            <Fa icon={faPlus}/>
        </button>
    </h1>
    <hr>
    <DragAndDropContainer items={category.items} onFinalize={onFinalize}
                          class="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {#snippet item(trackable)}
            <TrackableCard {trackable} {date} {weekStart} onEdit={() => onEdit(trackable)}
                           onLog={() => onLog(trackable)}/>
        {/snippet}
    </DragAndDropContainer>
</div>
