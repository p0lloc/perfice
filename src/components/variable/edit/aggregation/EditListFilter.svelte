<script lang="ts">
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {FILTER_COMPARISON_OPERATORS} from "@perfice/model/variable/ui";
    import {
        pList,
        prettyPrintPrimitive,
        type PrimitiveValue,
        PrimitiveValueType,
        pString
    } from "@perfice/model/primitive/primitive";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    import EditListOperatorValue from "@perfice/components/variable/edit/aggregation/EditListOperatorValue.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {FilterComparisonOperator, type JournalEntryFilter} from "@perfice/services/variable/filtering";

    let {filter, onChange, fields, onRemove}: {
        filter: JournalEntryFilter, onChange: (v: JournalEntryFilter) => void,

        fields: ({ value: string, name: string }[]) | undefined,
        onRemove: () => void,
    } = $props();


    function onFieldChange(v: string) {
        onChange({...filter, field: v});
    }

    function onOperatorChange(v: FilterComparisonOperator) {
        if (v === FilterComparisonOperator.IN || v === FilterComparisonOperator.NOT_IN) {
            onChange({...filter, value: pList([]), operator: v});
        } else {
            onChange({...filter, operator: v});
        }
    }

    function onSingleValueChange(v: { currentTarget: HTMLInputElement }) {
        onChange({...filter, value: pString(v.currentTarget.value)});
    }

    function onListValueChange(v: PrimitiveValue[]) {
        onChange({...filter, value: pList(v)});
    }
</script>

{#if fields != null}
    <div class="rounded-xl">
        <div class="bg-gray-50 w-full p-2 flex justify-between items-center rounded-t-xl border text-gray-500">
            Filter
            <IconButton icon={faTrash} onClick={onRemove}/>
        </div>
        <div class="flex md:flex-row flex-col gap-1 items-start border p-1 rounded-b-xl">
            <DropdownButton class="flex-1 md:w-auto w-full" small={true} items={fields} value={filter.field}
                            onChange={onFieldChange}/>
            <DropdownButton class="md:w-auto w-full" small={true} items={FILTER_COMPARISON_OPERATORS}
                            value={filter.operator}
                            onChange={onOperatorChange}/>
            {#if (filter.operator === FilterComparisonOperator.IN || filter.operator === FilterComparisonOperator.NOT_IN)
            && filter.value.type === PrimitiveValueType.LIST}

                <EditListOperatorValue value={filter.value.value} onChange={onListValueChange}/>
            {:else}
                <input type="text" class="input md:w-auto w-full flex-1 min-w-0"
                       value={prettyPrintPrimitive(filter.value)}
                       onchange={onSingleValueChange}/>
            {/if}
        </div>
    </div>
{/if}
