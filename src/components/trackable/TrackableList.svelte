<script lang="ts">
    import {categorizedTrackables, trackables} from "@perfice/main";
    import TrackableCategoryContainer from "@perfice/components/trackable/TrackableCategoryContainer.svelte";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import type {TrackableCategory} from "@perfice/model/trackable/trackable.js";
    import {onDestroy} from "svelte";
    import {disposeCachedStoreKey} from "@perfice/stores/cached";

    let {date, weekStart, onEdit, onLog}: {
        date: Date,
        weekStart: WeekStart,
        onEdit: (t: Trackable) => void,
        onLog: (t: Trackable) => void
    } = $props();

    function onReorder(items: Trackable[]) {
        trackables.reorderTrackables(items);
    }

    async function disposeTrackableKeys() {
        // The trackable cards might be rerendered quite often, but we only need to dispose them whenever we leave the "Trackables" page.
        // This avoids them re-fetching the data anytime the component is re-rendered.

        // TODO: we also need to dispose cache keys when trackables are deleted

        let value = await $trackables;
        for (let trackable of value) {
            disposeCachedStoreKey(trackable.id);
        }
    }

    onDestroy(disposeTrackableKeys);
</script>

{#await $categorizedTrackables}
    Loading...
{:then categories}
    <div class="flex flex-col gap-4">
        {#each categories as category (category.category?.id)}
            <TrackableCategoryContainer {date} category={category} {weekStart}
                                        {onEdit} {onLog}
                                        onReorder={(items) => onReorder(items)}/>
        {/each}
    </div>
{/await}
