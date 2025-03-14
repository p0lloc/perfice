<script lang="ts">
    import {WEEK_DAYS_SHORT} from "@perfice/util/time/format";
    import type {JournalDay} from "@perfice/stores/journal/grouped";
    import JournalMultiGroup from "@perfice/components/journal/day/JournalMultiGroup.svelte";
    import JournalSingleGroup from "@perfice/components/journal/day/JournalSingleGroup.svelte";
    import JournalDayDate from "@perfice/components/journal/day/JournalDayDate.svelte";
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import JournalTagEntries from "@perfice/components/journal/day/JournalTagEntries.svelte";

    let {day, onEntryClick, onEntryDelete, selectedEntries}: {
        day: JournalDay, onEntryClick: (entry: JournalEntry) => void,
        onEntryDelete: (entry: JournalEntry) => void,
        selectedEntries: JournalEntry[]
    } = $props();

    let date = $derived(new Date(day.timestamp));
    let weekDay = $derived(WEEK_DAYS_SHORT[date.getDay()]);
    let dayOfMonth = $derived(date.getDate().toString().padStart(2, "0"));
</script>

<div class="bg-white border p-4 md:p-8 rounded-xl shadow-md w-full">
    <div class="flex gap-8 items-start">

        <JournalDayDate {date} {dayOfMonth} {weekDay}/>
        <div class="w-full flex flex-col gap-4 min-w-0">
            <div class="md:hidden">
                <p class="text-gray-400 text-xl">{weekDay} {dayOfMonth}</p>
            </div>

            <JournalTagEntries tagEntries={day.tagEntries}/>

            {#if day.multiEntries.length > 0}
                <div class="journal-grid">
                    {#each day.multiEntries as group (group.id)}
                        <JournalMultiGroup {selectedEntries} {group} {onEntryClick} {onEntryDelete}/>
                    {/each}
                </div>
            {/if}

            <div class="journal-grid"
                 class:mt-4={day.multiEntries.length > 0}
            >
                {#each day.singleEntries as group (group.id)}
                    <JournalSingleGroup {selectedEntries} {group} {onEntryClick} {onEntryDelete}/>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .journal-grid {
        @apply grid grid-cols-1 md:grid-cols-2 gap-2;
    }
</style>
