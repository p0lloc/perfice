<script lang="ts">
    import {categorizedTrackables} from "@perfice/main";
    import TrackableCategoryContainer from "@perfice/components/trackable/TrackableCategoryContainer.svelte";
    import type {WeekStart} from "@perfice/model/variable/time/time";

    let {date, weekStart}: { date: Date, weekStart: WeekStart } = $props();
</script>

{#await $categorizedTrackables}
    Loading...
{:then categories}
    <div class="flex flex-col gap-4">
        {#each categories as category(category.category?.id)}
            <TrackableCategoryContainer {date} {category} {weekStart}/>
        {/each}
    </div>
{/await}
