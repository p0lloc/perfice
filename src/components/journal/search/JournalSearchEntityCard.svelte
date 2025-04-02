<script lang="ts">
    import {
        SEARCH_ENTITY_MODES,
        SEARCH_ENTITY_TYPES,
        type SearchEntity,
        SearchEntityMode,
        SearchEntityType
    } from "@perfice/model/journal/search/search";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    import type {Component} from "svelte";
    import TrackableSearchOptions
        from "@perfice/components/journal/search/types/trackable/TrackableSearchOptions.svelte";
    import TagSearchOptions from "@perfice/components/journal/search/types/tag/TagSearchOptions.svelte";
    import FreeTextSearchOptions from "@perfice/components/journal/search/types/freeText/FreeTextSearchOptions.svelte";
    import DateSearchOptions from "@perfice/components/journal/search/types/date/DateSearchOptions.svelte";
    import TrackableSearchActions
        from "@perfice/components/journal/search/types/trackable/TrackableSearchActions.svelte";
    import TagSearchActions from "@perfice/components/journal/search/types/tag/TagSearchActions.svelte";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import type {JournalSearchUiDependencies} from "@perfice/model/journal/search/ui";

    let {entity, onChange, onDelete, dependencies}: {
        entity: SearchEntity,
        onChange: (entity: SearchEntity) => void,
        onDelete: () => void,
        dependencies: JournalSearchUiDependencies
    } = $props();

    let uiDefinition = $derived(SEARCH_ENTITY_TYPES.find(e => e.id == entity.type)!);

    const CONTENT_RENDERERS: Record<SearchEntityType, Component<{
        options: any,
        onChange: (options: any) => void,
        dependencies: JournalSearchUiDependencies
    }>> = {
        [SearchEntityType.TRACKABLE]: TrackableSearchOptions,
        [SearchEntityType.TAG]: TagSearchOptions,
        [SearchEntityType.FREE_TEXT]: FreeTextSearchOptions,
        [SearchEntityType.DATE]: DateSearchOptions,
    };

    const ACTION_RENDERERS: Partial<Record<SearchEntityType, Component<{
        options: any,
        onChange: (options: any) => void
    }>>> = {
        [SearchEntityType.TRACKABLE]: TrackableSearchActions,
        [SearchEntityType.TAG]: TagSearchActions,
    };

    function onOptionsChange(options: any) {
        onChange({...entity, value: options});
    }

    function onModeChange(mode: SearchEntityMode) {
        onChange({...entity, mode});
    }

    const ActionRendererComponent = $derived(ACTION_RENDERERS[entity.type]);
    const ContentRendererComponent = $derived(CONTENT_RENDERERS[entity.type]);
</script>


<div class="border rounded-md bg-white">
    <div class="row-between p-2 border-b">
        <div class="row-gap text-gray-500 ">
            <Fa icon={uiDefinition.icon} class="w-4"/>
            <span class="font-bold">{uiDefinition.name}</span>
            <DropdownButton class="text-sm" onChange={onModeChange} value={entity.mode} items={SEARCH_ENTITY_MODES}/>
        </div>
        <div class="row-between text-gray-500">
            <ActionRendererComponent options={entity.value} onChange={onOptionsChange}/>
            <IconButton icon={faTrash} onClick={onDelete}/>
        </div>
    </div>
    <ContentRendererComponent options={entity.value} onChange={onOptionsChange} {dependencies}/>
</div>