<script lang="ts">
    import {forms, groupedJournal, journal} from "@perfice/main";
    import JournalDayCard from "@perfice/components/journal/day/JournalDayCard.svelte";
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {extractValueFromDisplay} from "@perfice/services/variable/types/list";
    import {faBars, faBook, faTrash} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import {deleteIdentifiedInArray} from "@perfice/util/array";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import Title from "@perfice/components/base/title/Title.svelte";

    let formModal: FormModal;
    let deleteModal: GenericDeleteModal<JournalEntry>;
    let deleteMultiModal: GenericDeleteModal<JournalEntry[]>;

    let selectMode = $state(false);
    let selectedEntries = $state<JournalEntry[]>([]);

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
        if (selectMode) {
            if (selectedEntries.some(e => e.id === entry.id)) {
                selectedEntries = deleteIdentifiedInArray(selectedEntries, entry.id);
            } else {
                selectedEntries.push(entry);
            }

            return;
        }

        let form = await forms.getFormById(entry.formId);
        let templates = await forms.getTemplatesByFormId(entry.formId);
        let snapshot = await forms.getFormSnapshotById(entry.snapshotId);

        if (form == null || snapshot == null) return;

        let answers: Record<string, PrimitiveValue> = {};
        for (let [id, value] of Object.entries(entry.answers)) {
            answers[id] = extractValueFromDisplay(value);
        }

        formModal.open(form, snapshot.questions, snapshot.format, new Date(entry.timestamp),
            templates, answers, entry);
    }

    function onEntryDelete(entry: JournalEntry) {
        journal.deleteEntryById(entry.id);
    }

    function onMultiEntryStartDelete() {
        deleteMultiModal.open(selectedEntries);
    }

    function onMultiEntryDelete(entries: JournalEntry[]) {
        selectedEntries = [];
        // TODO: delete all entries at once
        entries.forEach(e => journal.deleteEntryById(e.id));
    }

    function onEntryStartDelete(entry: JournalEntry) {
        deleteModal.open(entry);
    }
</script>

<svelte:window onwheel={onScroll}/>

<GenericDeleteModal subject="this entry" onDelete={onEntryDelete} bind:this={deleteModal}/>
<GenericDeleteModal subject="{selectedEntries.length} entries" onDelete={onMultiEntryDelete} bind:this={deleteMultiModal}/>

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
        <div class="row-between items-center mb-8 md:flex hidden">
            <Title title="Journal" icon={faBook}/>
            <div class="row-gap">
                {#if selectMode}
                    {selectedEntries.length} selected
                {:else}
                    Select
                {/if}
                <input type="checkbox" bind:checked={selectMode}/>
                {#if selectedEntries.length > 0}
                    <IconButton class="text-gray-500" icon={faTrash} onClick={onMultiEntryStartDelete}/>
                {/if}
            </div>
        </div>
        <div class="flex flex-col gap-4" id="mainContainer">
            {#each days as day}
                <JournalDayCard {selectedEntries} onEntryClick={onEntryClick} onEntryDelete={onEntryStartDelete} {day}/>
            {/each}
        </div>
    {/await}
</div>
