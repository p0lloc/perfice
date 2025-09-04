<script lang="ts">
    import {VariableTypeName} from "@perfice/model/variable/variable";
    import type {Variable} from "@perfice/model/variable/variable.js";
    import type {EditLatestVariableState} from "@perfice/stores/variable/editState";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import EditListFilters from "@perfice/components/variable/edit/aggregation/EditListFilters.svelte";
    import type {JournalEntryFilter} from "@perfice/services/variable/filtering";
    import {LatestVariableType} from "@perfice/services/variable/types/latest";
    import type {EditConstantOrVariableState} from "@perfice/model/goal/ui";
    import {variableEditProvider} from "@perfice/stores";

    let {variable, value, editState}: {
        variable: Variable,
        value: LatestVariableType,
        editState: EditLatestVariableState,
        onEdit: (v: EditConstantOrVariableState) => void
    } = $props();

    // TODO: we need a latest value variable
    let field = $state<string>(Object.keys(value.getFields())[0]);
    let filters = $state<JournalEntryFilter[]>(value.getFilters());

    function onEntityChange(formId: string) {
        entityFormId = formId;
        variableEditProvider.updateVariable({
            ...variable, type: {
                type: VariableTypeName.LATEST,
                value: new LatestVariableType(formId, value.getFields(), value.getFilters())
            }
        });
    }

    function onFieldChange(newField: string) {
        field = newField;
        variableEditProvider.updateVariable({
            ...variable, type: {
                type: VariableTypeName.LATEST,
                value: new LatestVariableType(value.getFormId(), {[newField]: false}, value.getFilters())
            }
        });
    }

    function onFilterChange(newFilters: JournalEntryFilter[]) {
        filters = newFilters;
        variableEditProvider.updateVariable({
            ...variable, type: {
                type: VariableTypeName.LATEST,
                value: new LatestVariableType(value.getFormId(),
                    value.getFields(), $state.snapshot(newFilters))
            }
        });
    }

    let entityFormId = $derived(value.getFormId());
    let questions = $derived(editState.forms.find(f => f.id == entityFormId)?.questions ?? []);

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
        Entity
        <DropdownButton items={entities} value={entityFormId} onChange={onEntityChange}/>
    </div>
    <div class="row-between">
        Field
        {#if dropdownQuestions != null}
            <DropdownButton items={dropdownQuestions} value={field} onChange={onFieldChange}/>
        {/if}
    </div>
    <EditListFilters fields={questions} filters={filters} onChange={onFilterChange}/>
</div>
