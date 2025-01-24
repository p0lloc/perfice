<script lang="ts">
    import type {CategoryList} from "@perfice/util/category";
    import {type Trackable, TrackableCardType, type TrackableCategory} from "@perfice/model/trackable/trackable";
    import TrackableCard from "@perfice/components/trackable/card/TrackableCard.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {trackables} from "@perfice/main";
    import type {WeekStart} from "@perfice/model/variable/time/time";

    let {category, date, weekStart}: { category: CategoryList<TrackableCategory, Trackable>, date: Date, weekStart: WeekStart } = $props();

    async function createTrackable(){
        let trackableId = crypto.randomUUID();
        await trackables.createTrackable({
            id: trackableId,
            name: "testing",
            formId: trackableId,
            categoryId: category.category?.id ?? null,
            cardType: TrackableCardType.CHART,
            cardSettings: {},
            dependencies: {}
        })
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
        {#each category.items as trackable(trackable.id)}
            <TrackableCard {trackable} {date} {weekStart} />
        {/each}
    </div>
</div>
