<script lang="ts">
    import {forms, groupedJournal, journal, journalSearch, paginatedJournal, tagEntries} from "@perfice/stores";
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
    import {faBook, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import Title from "@perfice/components/base/title/Title.svelte";
    import type {SearchEntity} from "@perfice/model/journal/search/search";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {onMount} from "svelte";
    import {constructSearchParam, parseSearchFromUrl} from "@perfice/stores/journal/search";
    import {navigate} from "@perfice/app";

    let formModal: FormModal;
    let deleteModal: GenericDeleteModal<JournalEntity>;
    let deleteMultiModal: GenericDeleteModal<JournalEntity[]>;
    let {params}: { params: Record<string, string> } = $props();

    let selectMode = $state(false);
    let currentSearch = $state<SearchEntity[] | null>(null);
    let selectedEntities = $state<JournalEntity[]>([]);

    // Padding between bottom and scroll end
    const SCROLL_SLACK = 300;

    async function load() {
        let searchData = params.search;
        if (searchData != undefined) {
            currentSearch = parseSearchFromUrl(searchData);
            await journalSearch.search(currentSearch);
        } else {
            await paginatedJournal.load();
        }
    }

    function onScroll() {
        if (currentSearch != null) return;

        let reachedBottom = (window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - SCROLL_SLACK;
        if (reachedBottom) {
            paginatedJournal.nextPage();
        }
    }

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

    function onFormEntryStartDelete(entry: JournalEntry) {
        onEntityStartDelete(jeForm(entry));
    }

    function goToSearch() {
        if (currentSearch != null) {
            navigate(`/journal/search/${constructSearchParam(currentSearch)}`);
            return;
        }

        navigate("/journal/search");
    }

    // Scroll might already be at bottom, give time for the initial page load to finish
    // Then check if we're at the bottom and load more
    onMount(() => setTimeout(() => onScroll(), 500));

    load();
    let title = $derived(currentSearch != null ? "Search result" : "Journal");
</script>

<svelte:window onwheel={onScroll} ontouchmove={onScroll}/>

<GenericDeleteModal subject="this entry" onDelete={deleteEntity} bind:this={deleteModal}/>
<GenericDeleteModal subject="{selectedEntities.length} entries" onDelete={onMultiEntryDelete}
                    bind:this={deleteMultiModal}/>

<MobileTopBar title={title}>
    {#snippet actions()}
        <IconButton icon={faSearch} onClick={goToSearch}/>
    {/snippet}
</MobileTopBar>
<FormModal largeLogButton={false} bind:this={formModal} onDelete={onFormEntryStartDelete}/>
<div class="mx-auto w-screen md:w-3/4 xl:w-1/2 md:px-0 px-4 py-6 md:py-10 main-content">
    {#await $groupedJournal}
        Loading...
    {:then days}
        <div class="row-between items-center md:mb-8 mb-4 md:flex hidden">
            <Title title={title} icon={currentSearch != null ? faSearch : faBook}/>
            <div class="row-gap md:w-auto w-full flex justify-end">
                <Button onClick={goToSearch} class="hidden md:flex items-center gap-2">Search
                    <Fa icon={faSearch}/>
                </Button>
                <div class="row-gap bg-white border px-2 rounded-md h-10">
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
