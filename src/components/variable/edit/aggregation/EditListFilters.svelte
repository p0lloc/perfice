<script lang="ts">
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import {FilterComparisonOperator, type ListVariableFilter} from "@perfice/services/variable/types/list";
    import {pString} from "@perfice/model/primitive/primitive";
    import EditListFilter from "@perfice/components/variable/edit/aggregation/EditListFilter.svelte";
    import {updateIdentifiedInArray} from "@perfice/util/array";

    let {filters, onChange, fields}: {
        filters: ListVariableFilter[],
        onChange: (v: ListVariableFilter[]) => void,
        fields: ({ value: string, name: string }[]) | undefined
    } = $props();

    function addFilter() {
        onChange([...(filters ?? []), {
            id: crypto.randomUUID(),
            field: "",
            operator: FilterComparisonOperator.EQUAL,
            value: pString("")
        }]);
    }

    function onFilterChange(filter: ListVariableFilter) {
        onChange(updateIdentifiedInArray(filters, filter));
    }

    function onRemoveFilter(filter: ListVariableFilter) {
        onChange(filters.filter(f => f.id != filter.id));
    }
</script>

<div class="row-gap">
    Filters
    <IconButton icon={faPlus} onClick={addFilter}/>
</div>

<div class="flex flex-col gap-2">
    {#each filters as filter}
        <EditListFilter {fields} {filter} onChange={(v) => onFilterChange(v)} onRemove={() => onRemoveFilter(filter)}/>
    {/each}
</div>
