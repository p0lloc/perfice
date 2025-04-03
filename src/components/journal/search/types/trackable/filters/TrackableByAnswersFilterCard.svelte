<script lang="ts">
    import EditListFilters from "@perfice/components/variable/edit/aggregation/EditListFilters.svelte";
    import type {Form} from "@perfice/model/form/form";
    import type {ByAnswersFilter} from "@perfice/model/journal/search/search";
    import type {JournalSearchUiDependencies} from "@perfice/model/journal/search/ui";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {faFilter, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {FilterComparisonOperator} from "@perfice/services/variable/filtering";
    import {pString} from "@perfice/model/primitive/primitive";

    let {
        filter,
        onChange,
        onDelete,
        dependencies,
        selectedTrackables,
    }: {
        filter: ByAnswersFilter;
        onChange: (filter: ByAnswersFilter) => void;
        onDelete: () => void;
        dependencies: JournalSearchUiDependencies;
        selectedTrackables: Set<[Trackable, Form]>;
    } = $props();

    function addFilter() {
        onChange({
            ...filter,
            filters: [...filter.filters, {
                id: crypto.randomUUID(),
                field: "",
                operator: FilterComparisonOperator.EQUAL,
                value: pString("")
            }]
        });
    }

    let fields = $derived(
        selectedTrackables
            .values()
            .flatMap(([_, form]) =>
                form.questions
            )
            .toArray(),
    );
</script>

<div class="border">
    <div class="row-between px-4 py-2">
        <div class="row-gap flex-wrap">
            <Fa icon={faFilter}></Fa>
            By answers
        </div>
        <div class="row-gap">
            <IconButton icon={faPlus} onClick={addFilter}/>
            <IconButton icon={faTrash} onClick={onDelete}/>
        </div>
    </div>
    <div class="p-4">
        {#if fields.length === 0}
            <span class="text-red-500">There are no selected trackables, please narrow your search with another filter.</span>
        {/if}
        <EditListFilters
                addButton={false}
                {fields}
                filters={filter.filters}
                onChange={(v) => onChange({ ...filter, filters: v })}
        />
    </div>
</div>
