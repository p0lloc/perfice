<script lang="ts">
    import type {OneOfFilter} from "@perfice/model/journal/search/search";
    import GenericFilterContainer from "@perfice/components/journal/search/types/GenericFilterContainer.svelte";
    import MultiSelectDropdownButton from "@perfice/components/base/dropdown/MultiSelectDropdownButton.svelte";

    let {filter, onChange, onDelete, items}: {
        filter: OneOfFilter,
        onChange: (filter: OneOfFilter) => void,
        onDelete: () => void,
        items: { name: string, value: string }[]
    } = $props();
</script>

<GenericFilterContainer name="One of" {onDelete}>
    <MultiSelectDropdownButton onChange={(v) => onChange({...filter, values: v})} noneText="None" value={filter.values}
                               items={items}/>
</GenericFilterContainer>
