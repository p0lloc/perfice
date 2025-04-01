<script lang="ts">
    import {forms, groupedJournal, journal, journalSearch, paginatedJournal, tagEntries} from "@perfice/app";
    import JournalDayCard from "@perfice/components/journal/day/JournalDayCard.svelte";
    import {
        jeForm,
        jeTag,
        type JournalEntity,
        JournalEntityType,
        type JournalEntry
    } from "@perfice/model/journal/journal";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {extractValueFromDisplay} from "@perfice/services/variable/types/list";
    import {faBars, faBook, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import Title from "@perfice/components/base/title/Title.svelte";
    import {onMount} from "svelte";
    import type {JournalSearch} from "@perfice/model/journal/search/search";

    let formModal: FormModal;
    let deleteModal: GenericDeleteModal<JournalEntity>;
    let deleteMultiModal: GenericDeleteModal<JournalEntity[]>;
    let {params}: { params: Record<string, string> } = $props();

    let selectMode = $state(false);
    let searched = $state(false);
    let selectedEntities = $state<JournalEntity[]>([]);

    // Padding between bottom and scroll end
    const SCROLL_SLACK = 300;

    async function load() {
        let searchData = params.search;
        if (searchData != undefined) {
            try {
                let search: JournalSearch = JSON.parse(atob(searchData));
                await journalSearch(search);
                searched = true;
            } catch (ex) {
                alert("Incorrectly formatted search")
            }
        } else {
            await paginatedJournal.load();
        }
    }

    function onScroll() {
        if (searched) return;

        let reachedBottom = (window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - SCROLL_SLACK;
        if (reachedBottom) {
            paginatedJournal.nextPage();
        }
    }

    onMount(() => {
        load();
    });

    async function onEntityClick(entity: JournalEntity) {
        if (selectMode) {
            if (selectedEntities.some(e => e.entry.id === entity.entry.id)) {
                selectedEntities = selectedEntities.filter(v => v.entry.id != entity.entry.id);
            } else {
                selectedEntities.push(entity);
            }

            return;
        }

        if (entity.type == JournalEntityType.FORM_ENTRY) {
            await onEntryClick(entity.entry);
        } else {
            onEntityStartDelete(entity);
        }
    }

    async function onEntryClick(entry: JournalEntry) {
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

    function deleteEntity(entity: JournalEntity) {
        if (entity.type == JournalEntityType.FORM_ENTRY) {
            journal.deleteEntryById(entity.entry.id);
        } else {
            tagEntries.deleteEntryById(entity.entry.id);
        }
    }

    function onMultiEntryStartDelete() {
        deleteMultiModal.open(selectedEntities);
    }

    function onMultiEntryDelete(entries: JournalEntity[]) {
        selectedEntities = [];
        // TODO: delete all entries at once
        entries.forEach(e => deleteEntity(e));
    }

    function onEntityStartDelete(entity: JournalEntity) {
        deleteModal.open(entity);
    }
</script>

<svelte:window onwheel={onScroll}/>

<GenericDeleteModal subject="this entry" onDelete={deleteEntity} bind:this={deleteModal}/>
<GenericDeleteModal subject="{selectedEntities.length} entries" onDelete={onMultiEntryDelete}
                    bind:this={deleteMultiModal}/>

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
            <Title title={searched ? "Search result": "Journal"} icon={searched ? faSearch : faBook}/>
            <div class="row-gap">
                {#if selectMode}
                    {selectedEntities.length} selected
                {:else}
                    Select
                {/if}
                <input type="checkbox" bind:checked={selectMode}/>
                {#if selectedEntities.length > 0}
                    <IconButton class="text-gray-500" icon={faTrash} onClick={onMultiEntryStartDelete}/>
                {/if}
            </div>
        </div>
        <div class="flex flex-col gap-4" id="mainContainer">
            {#each days as day}
                <JournalDayCard {selectedEntities}
                                onEntryClick={(e) => onEntityClick(jeForm(e))}
                                onTagEntryClick={(e) => onEntityClick(jeTag(e))}
                                onFormEntryDelete={(e) => onEntityStartDelete(jeForm(e))} {day}/>
            {/each}
        </div>
    {/await}
</div>
