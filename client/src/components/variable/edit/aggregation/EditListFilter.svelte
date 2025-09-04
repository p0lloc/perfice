<script lang="ts">
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {FILTER_COMPARISON_OPERATORS} from "@perfice/model/variable/ui";
    import {
        pList,
        type PrimitiveValue,
        PrimitiveValueType,
        pString
    } from "@perfice/model/primitive/primitive";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    import EditListOperatorValue from "@perfice/components/variable/edit/aggregation/EditListOperatorValue.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {FilterComparisonOperator, type JournalEntryFilter} from "@perfice/services/variable/filtering";
    import type {FormQuestion} from "@perfice/model/form/form";
    import FormQuestionValueInput from "@perfice/components/form/valueInput/FormQuestionValueInput.svelte";

    let {filter, onChange, questions, onRemove}: {
        filter: JournalEntryFilter,
        onChange: (v: JournalEntryFilter) => void,

        questions: FormQuestion[],
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

    function onSingleValueChange(v: PrimitiveValue) {
        onChange({...filter, value: v});
    }

    function onListValueChange(v: PrimitiveValue[]) {
        onChange({...filter, value: pList(v)});
    }

    let availableFields = $derived(questions.map(v => {
        return {
            value: v.id,
            name: v.name,
        }
    }));

    let currentQuestion = $derived(questions.find(v => v.id == filter.field));

    let listField = $derived((filter.operator === FilterComparisonOperator.IN || filter.operator === FilterComparisonOperator.NOT_IN));
</script>

{#if availableFields != null}
    <div class="rounded-xl">
        <div class="bg-gray-50 w-full p-2 flex justify-between items-center rounded-t-xl border text-gray-500">
            Filter
            <IconButton icon={faTrash} onClick={onRemove}/>
        </div>
        <div class="flex md:flex-row flex-col gap-1 items-start border p-1 rounded-b-xl">
            <DropdownButton class="flex-1 md:w-auto w-full" small={true} items={availableFields} value={filter.field}
                            onChange={onFieldChange}/>

            <DropdownButton class="md:w-auto w-full" small={true} items={FILTER_COMPARISON_OPERATORS}
                            value={filter.operator}
                            onChange={onOperatorChange}/>

            {#if currentQuestion != null}
                {#if listField && filter.value.type === PrimitiveValueType.LIST}
                    <EditListOperatorValue question={currentQuestion} value={filter.value.value}
                                           onChange={onListValueChange}/>
                {:else}
                    <FormQuestionValueInput small={true} class="flex-1 min-w-0 w-full md:w-auto"
                                            question={currentQuestion}
                                            value={filter.value}
                                            onChange={onSingleValueChange}/>
                {/if}
            {:else}
                <input type="text" class="flex-1 w-full md:w-auto"/>
            {/if}
        </div>
    </div>
{/if}
