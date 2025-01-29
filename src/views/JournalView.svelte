<script lang="ts">
    import {forms, groupedJournal, journal} from "@perfice/main";
    import JournalDayCard from "@perfice/components/journal/day/JournalDayCard.svelte";
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";

    let formModal: FormModal;

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

    async function onEntryClick(entry: JournalEntry) {
        let form = await forms.getFormById(entry.formId);
        let snapshot = await forms.getFormSnapshotById(entry.snapshotId);

        if (form == null || snapshot == null) return;

        let answers: Record<string, PrimitiveValue> = {};
        for (let [id, value] of Object.entries(entry.answers)) {
            if(value.type == PrimitiveValueType.DISPLAY) {
                answers[id] = value.value.value
            } else {
                answers[id] = value;
            }
        }

        formModal.open(form, snapshot.questions, new Date(entry.timestamp),
            answers, entry);
    }

    function onEntryDelete(entry: JournalEntry) {
        journal.deleteEntryById(entry.id);
    }
</script>

<svelte:window onwheel={onScroll}/>

<FormModal bind:this={formModal}/>
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
