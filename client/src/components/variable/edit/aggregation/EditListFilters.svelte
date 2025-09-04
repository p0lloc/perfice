<script lang="ts">
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import {pString} from "@perfice/model/primitive/primitive";
    import EditListFilter from "@perfice/components/variable/edit/aggregation/EditListFilter.svelte";
    import {updateIdentifiedInArray} from "@perfice/util/array";
    import {FilterComparisonOperator, type JournalEntryFilter} from "@perfice/services/variable/filtering";
    import type {FormQuestion} from "@perfice/model/form/form";

    let {filters, onChange, fields, addButton = true}: {
        filters: JournalEntryFilter[],
        onChange: (v: JournalEntryFilter[]) => void,
        addButton?: boolean,
        fields: FormQuestion[]
    } = $props();

    function addFilter() {
        onChange([...(filters ?? []), {
            id: crypto.randomUUID(),
            field: "",
            operator: FilterComparisonOperator.EQUAL,
            value: pString("")
        }]);
    }

    function onFilterChange(filter: JournalEntryFilter) {
        onChange(updateIdentifiedInArray(filters, filter));
    }

    function onRemoveFilter(filter: JournalEntryFilter) {
        onChange(filters.filter(f => f.id != filter.id));
    }
</script>

{#if addButton}
    <div class="row-gap">
        Filters
        <IconButton icon={faPlus} onClick={addFilter}/>
    </div>
{/if}

<div class="flex flex-col gap-2">
    {#each filters as filter}
        <EditListFilter questions={fields} {filter} onChange={(v) => onFilterChange(v)}
                        onRemove={() => onRemoveFilter(filter)}/>
    {/each}
</div>
