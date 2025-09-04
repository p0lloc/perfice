<script lang="ts">
    import {onMount} from "svelte";
    import {
        createDefaultSearch,
        createDefaultSearchEntity,
        DEFAULT_SEARCH_ID,
        type JournalSearch,
        SEARCH_ENTITY_TYPES,
        type SearchEntity,
        SearchEntityMode,
        SearchEntityType,
    } from "@perfice/model/journal/search/search";
    import JournalSearchEntityCard from "@perfice/components/journal/search/JournalSearchEntityCard.svelte";
    import {faArrowLeft, faExclamationTriangle, faPlus, faSave, faSearch} from "@fortawesome/free-solid-svg-icons";
    import Title from "@perfice/components/base/title/Title.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import HorizontalPlusButton from "@perfice/components/base/button/HorizontalPlusButton.svelte";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import {journalSearch} from "@perfice/stores";
    import type {JournalSearchUiDependencies} from "@perfice/model/journal/search/ui";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {emptyPromise, resolvedUpdatePromise} from "@perfice/util/promise";
    import {constructSearchParam, parseSearchFromUrl} from "@perfice/stores/journal/search";
    import {back, navigate} from "@perfice/app";

    let search = $state<JournalSearch>({} as JournalSearch);
    let dependencies = $state({} as Promise<JournalSearchUiDependencies>);
    let savedSearches = $state<Promise<JournalSearch[]>>(emptyPromise());
    let {params}: { params: Record<string, string> } = $props();
    let addEntityContextMenu: ContextMenu;

    onMount(() => {
        let searchData = params.search;
        if (searchData != undefined) {
            search = {id: DEFAULT_SEARCH_ID, name: "Search", entities: parseSearchFromUrl(searchData)};
        } else {
            search = createDefaultSearch();
        }
    });

    loadDependencies();

    async function loadDependencies() {
        savedSearches = journalSearch.fetchSavedSearches();
        dependencies = journalSearch.loadEditDependencies();
    }

    function onEntityChange(entity: SearchEntity) {
        search.entities = updateIdentifiedInArray(search.entities, entity);
    }

    function onSearch() {
        let encoded = constructSearchParam(search.entities);
        navigate(`/journal/${encoded}`);
    }

    function addEntity(type: SearchEntityType) {
        search.entities.push(createDefaultSearchEntity(type));
    }

    function startAddingQuestion(
        e: MouseEvent & { currentTarget: HTMLButtonElement },
    ) {
        addEntityContextMenu?.openFromClick(e.currentTarget, e.currentTarget);
    }

    function saveSearch() {
        journalSearch.updateSavedSearch($state.snapshot(search));
    }

    function onDeleteEntity(entity: SearchEntity) {
        search.entities = deleteIdentifiedInArray(search.entities, entity.id);
    }

    async function onSavedSearchSelected(id: string) {
        if (id == "new") {
            let name = prompt("Name?");
            if (name == null) return;

            search.id = crypto.randomUUID();
            search.name = name;
            await journalSearch.createSavedSearch($state.snapshot(search));
            savedSearches = resolvedUpdatePromise(savedSearches, v => [...v, search]);
        } else {
            let byId = await journalSearch.fetchSavedSearchById(id);
            if (byId == null) return;

            search = byId;
        }
    }

    const savedSearchItems = $derived.by(async () => {
        let saved = await savedSearches;
        return [...saved.map(s => ({
            name: s.name,
            value: s.id
        })), {name: "Create new", value: "new", icon: faPlus, separated: true}];
    });

    const noInclude = $derived(!search.entities.some(e => e.mode === SearchEntityMode.INCLUDE));
</script>

<MobileTopBar title="Search">
    {#snippet leading()}
        <button class="icon-button" onclick={back}>
            <Fa icon={faArrowLeft}/>
        </button>
    {/snippet}
</MobileTopBar>
<div class="center-view md:mt-8 md:p-0 p-2 main-content">
    <div class="row-between">
        <Title title={"Search"} icon={faSearch}/>
        {#await savedSearchItems then value}
            <DropdownButton class="w-full md:w-auto" noneText="Saved searches" value={search.id} items={value}
                            onChange={onSavedSearchSelected}/>
        {/await}
    </div>
    {#await dependencies}
        Loading...
    {:then value}
        <div class="flex flex-col gap-2 mt-4">
            {#each search.entities as entity (entity.id)}
                <JournalSearchEntityCard
                        dependencies={value}
                        {entity}
                        onDelete={() => onDeleteEntity(entity)}
                        onChange={onEntityChange}
                />
            {/each}
            {#if noInclude}
                <span class="text-red-500 flex items-center gap-2">
                    <Fa icon={faExclamationTriangle}/>
                    There are no included entities, the search result will be empty.
                </span>
            {/if}
            <HorizontalPlusButton onClick={startAddingQuestion}/>
        </div>
    {/await}

    <ContextMenu bind:this={addEntityContextMenu}>
        <ContextMenuButtons
                buttons={SEARCH_ENTITY_TYPES.map((t) => {
                return {
                    name: t.name,
                    icon: t.icon,
                    action: () => addEntity(t.id),
                };
            })}
        />
    </ContextMenu>

    <div class="flex justify-end mt-4 items-center gap-2">
        {#if search.id !== DEFAULT_SEARCH_ID}
            <Button onClick={saveSearch} class="row-gap">
                Save search
                <Fa icon={faSave}/>
            </Button>
        {/if}
        <Button onClick={onSearch} class="row-gap">Search
            <Fa icon={faSearch}/>
        </Button>
    </div>
</div>
