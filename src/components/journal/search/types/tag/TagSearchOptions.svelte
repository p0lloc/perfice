<script lang="ts">
    import {
        type TagSearch,
        type TagSearchFilter,
    } from "@perfice/model/journal/search/tag";
    import TagFilterRenderer from "@perfice/components/journal/search/types/tag/TagFilterRenderer.svelte";
    import {
        deleteIdentifiedInArray,
        updateIdentifiedInArray,
    } from "@perfice/util/array";
    import type { JournalSearchUiDependencies } from "@perfice/model/journal/search/ui";

    let {
        options,
        onChange,
        dependencies,
    }: {
        options: TagSearch;
        onChange: (search: TagSearch) => void;
        dependencies: JournalSearchUiDependencies;
    } = $props();

    function onFilterChange(filter: TagSearchFilter) {
        onChange({
            ...options,
            filters: updateIdentifiedInArray(options.filters, filter),
        });
    }

    function onFilterDelete(filter: TagSearchFilter) {
        onChange({
            ...options,
            filters: deleteIdentifiedInArray(options.filters, filter.id),
        });
    }
</script>

{#each options.filters as filter (filter.id)}
    <TagFilterRenderer
        {filter}
        onChange={onFilterChange}
        {dependencies}
        onDelete={() => onFilterDelete(filter)}
    />
{/each}
