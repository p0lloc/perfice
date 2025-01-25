<script lang="ts">
    import {groupedJournal} from "@perfice/main";
    import JournalDayCard from "@perfice/components/journal/day/JournalDayCard.svelte";
    import type {JournalEntry} from "@perfice/model/journal/journal";

    async function load() {
        await groupedJournal.load();
    }

    function onScroll() {
        let reachedBottom = (window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight;
        if (reachedBottom) {
            groupedJournal.nextPage();
        }
    }

    $effect(() => {
        load();
    });

    function onEntryClick(entry: JournalEntry) {
        console.log("click", entry);
    }

    function onEntryDelete(entry: JournalEntry) {
        console.log("delete", entry);
    }
</script>

<svelte:window onwheel={onScroll}/>

<div class="mx-auto w-full md:w-1/2 md:px-0 px-4 py-10">
    {#await $groupedJournal}
        Loading...
    {:then days}
        <div class="flex flex-col gap-4" id="mainContainer">
            {#each days as day}
                <JournalDayCard onEntryClick={onEntryClick} onEntryDelete={onEntryDelete} {day}/>
            {/each}
        </div>
    {/await}
</div>
