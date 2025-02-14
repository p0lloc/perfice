<script lang="ts">
    import {forms, groupedJournal, journal} from "@perfice/main";
    import JournalDayCard from "@perfice/components/journal/day/JournalDayCard.svelte";
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {extractValueFromDisplay} from "@perfice/services/variable/types/list";
    import {faBars} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";

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
            answers[id] = extractValueFromDisplay(value);
        }

        formModal.open(form, snapshot.questions, new Date(entry.timestamp),
            answers, entry);
    }

    function onEntryDelete(entry: JournalEntry) {
        journal.deleteEntryById(entry.id);
    }
</script>

<svelte:window onwheel={onScroll}/>

<MobileTopBar title="Journal">
    {#snippet leading()}
        <button class="icon-button" onclick={() => console.log("TODO")}>
            <Fa icon={faBars}/>
        </button>
    {/snippet}
</MobileTopBar>
<FormModal bind:this={formModal}/>
<div class="mx-auto w-screen md:w-1/2 md:px-0 px-4 py-6 md:py-10 main-content">
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
