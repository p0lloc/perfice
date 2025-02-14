<script lang="ts">
    import type {CategoryList} from "@perfice/util/category";
    import {type Trackable, TrackableCardType, type TrackableCategory} from "@perfice/model/trackable/trackable";
    import TrackableCard from "@perfice/components/trackable/card/TrackableCard.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {trackables} from "@perfice/main";
    import type {WeekStart} from "@perfice/model/variable/time/time";

    import {draggable, droppable, type DragDropState, dndState} from '@thisux/sveltednd';
    import {flip} from 'svelte/animate';

    let {category = $bindable(), date, weekStart, onReorder, onEdit, onLog}: {
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
            formId: trackableId,
            categoryId: category.category?.id ?? null,
            cardType: TrackableCardType.CHART,
            cardSettings: {
                color: "#ff0000",
            },
            dependencies: {}
        })
    }

    function handleDrop(state: DragDropState<Trackable>) {
        const {draggedItem, targetContainer} = state;
        const dragIndex = category.items.findIndex((item: Trackable) => item.id === draggedItem.id);
        const dropIndex = parseInt(targetContainer ?? '0');

        if (dragIndex !== -1 && !isNaN(dropIndex)) {
            const [item] = category.items.splice(dragIndex, 1);
            category.items.splice(dropIndex, 0, item);
        }

        onReorder(category.items);
        dndState.isDragging = false;
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
    <div class="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {#each category.items as trackable, index (trackable.id)}
            <div class="rounded-xl"
                 use:draggable={{ container: index.toString(), dragData: trackable, interactive: ['.interactive'] }}
                 use:droppable={{
							container: index.toString(),
							callbacks: { onDrop: handleDrop }
						}}
                 animate:flip={{ duration: 300 }}
            >
                <TrackableCard {trackable} {date} {weekStart} onEdit={() => onEdit(trackable)} onLog={() => onLog(trackable)}/>
            </div>
        {/each}
    </div>
</div>
