<script lang="ts">
    import {AggregateVariableType} from "@perfice/services/variable/types/aggregate";
    import {VariableTypeName} from "@perfice/model/variable/variable";
    import {variableEditProvider} from "@perfice/main.js";
    import {type ListVariableFilter, ListVariableType} from "@perfice/services/variable/types/list";
    import type {Variable} from "@perfice/model/variable/variable.js";
    import type {EditAggregationVariableState} from "@perfice/stores/variable/editState";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {AGGREGATE_TYPES} from "@perfice/model/variable/ui";
    import EditListFilters from "@perfice/components/variable/edit/aggregation/EditListFilters.svelte";

    let {variable, value, editState}: { variable: Variable, value: AggregateVariableType, editState: EditAggregationVariableState } = $props();

    let aggregateType = $state<string>(value.getAggregateType());
    let field = $state<string>(value.getField());
    let filters = $state<ListVariableFilter[]>(editState.listVariableValue.getFilters());

    function onEntityChange(formId: string) {
        entityFormId = formId;
        editState.listVariableValue = new ListVariableType(formId, editState.listVariableValue.getFields(), editState.listVariableValue.getFilters());
        variableEditProvider.updateVariable({
            ...editState.listVariable, type: {
                type: VariableTypeName.LIST,
                value: editState.listVariableValue
            }
        });
    }

    function onFieldChange(newField: string) {
        field = newField;
        variableEditProvider.updateVariable({
            ...editState.listVariable, type: {
                type: VariableTypeName.LIST,
                value: new ListVariableType(editState.listVariableValue.getFormId(), {[newField]: false}, editState.listVariableValue.getFilters())
            }
        });
        variableEditProvider.updateVariable({
            ...variable, type: {
                type: VariableTypeName.AGGREGATE,
                value: new AggregateVariableType(value.getAggregateType(), editState.listVariable.id, newField)
            }
        });
    }

    function onFilterChange(newFilters: ListVariableFilter[]) {
        filters = newFilters;
        variableEditProvider.updateVariable({
            ...editState.listVariable, type: {
                type: VariableTypeName.LIST,
                value: new ListVariableType(editState.listVariableValue.getFormId(),
                    editState.listVariableValue.getFields(), $state.snapshot(newFilters))
            }
        });
    }

    let entityFormId = $derived(editState.listVariableValue.getFormId());
    let questions = $derived(editState.forms.find(f => f.id == entityFormId)?.questions);

    let entities = $derived(editState.entities.map(v => {
        return {
            value: v.formId,
            name: v.name,
        }
    }));

    let dropdownQuestions = $derived(questions?.map(v => {
        return {
            value: v.id,
            name: v.name,
        }
    }));

</script>

<div class="flex flex-col gap-2">
    <div class="row-between">
        Type
        <DropdownButton items={AGGREGATE_TYPES} value={aggregateType} onChange={(v) => aggregateType = v}/>
    </div>
    <div class="row-between">
        Entity
        <DropdownButton items={entities} value={entityFormId} onChange={onEntityChange}/>
    </div>
    <div class="row-between">
        Field
        {#if dropdownQuestions != null}
            <DropdownButton items={dropdownQuestions} value={field} onChange={onFieldChange}/>
        {/if}
    </div>
    <EditListFilters fields={dropdownQuestions} filters={filters} onChange={onFilterChange} />
</div>
