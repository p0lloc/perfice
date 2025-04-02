<script lang="ts">
    import GenericFilterContainer from "@perfice/components/journal/search/types/GenericFilterContainer.svelte";
    import MultiSelectDropdownButton from "@perfice/components/base/dropdown/MultiSelectDropdownButton.svelte";
    import type {ByCategoryFilter} from "@perfice/model/journal/search/search";

    let {filter, onChange, onDelete, items}: {
        filter: ByCategoryFilter,
        onChange: (filter: ByCategoryFilter) => void,
        onDelete: () => void,
        items: { name: string, value: string | null }[]
    } = $props();
</script>

<GenericFilterContainer name="By category" {onDelete}>
    <MultiSelectDropdownButton onChange={(v) => onChange({...filter, categories: v})} noneText="None"
                               value={filter.categories}
                               items={items}/>
</GenericFilterContainer>
