<script lang="ts">
    import {trackables, categorizedTrackables, trackableCategories} from "@perfice/main";
    import TrackableCategoryContainer from "@perfice/components/trackable/TrackableCategoryContainer.svelte";
    import type {WeekStart} from "@perfice/model/variable/time/time";

    let {date, weekStart}: { date: Date, weekStart: WeekStart } = $props();

    async function createCategory() {
        let categoryId = crypto.randomUUID();
        await trackableCategories.createCategory({
            id: categoryId,
            name: prompt("Name") ?? "test"
        })
    }
</script>

{#await $categorizedTrackables}
    Loading...
{:then categories}
    <button class="mb-10" onclick={createCategory}>Create category</button>
    <div class="flex flex-col gap-4">
        {#each categories as category(category.category?.id)}
            <TrackableCategoryContainer {date} {category} {weekStart}/>
        {/each}
    </div>
{/await}
