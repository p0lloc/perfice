<script lang="ts">
    import type {OneOfFilter} from "@perfice/model/journal/search/search";
    import type {JournalSearchUiDependencies} from "@perfice/model/journal/search/ui";
    import OneOfFilterCard from "@perfice/components/journal/search/common/OneOfFilterCard.svelte";

    let {filter, onChange, onDelete, dependencies}: {
        filter: OneOfFilter,
        onChange: (filter: OneOfFilter) => void,
        onDelete: () => void,
        dependencies: JournalSearchUiDependencies
    } = $props();
</script>

<OneOfFilterCard items={dependencies.trackables.map(t => ({name: t.name, value: t.id}))}
                 onDelete={onDelete} onChange={onChange} filter={filter}/>