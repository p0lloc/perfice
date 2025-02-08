<script lang="ts">
    import {
        ComparisonGoalCondition,
        ComparisonOperator,
        type ConstantOrVariable
    } from "@perfice/services/variable/types/goal";
    import {
        COMPARISON_OPERATORS,
        type EditConstantOrVariableState,
        type GoalSidebarAction,
        GoalSidebarActionType
    } from "@perfice/model/goal/ui";
    import AddSourceButton from "@perfice/components/goal/editor/condition/comparison/AddSourceButton.svelte";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {pNumber, prettyPrintPrimitive, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
    import type {VariableTypeName} from "@perfice/model/variable/variable";
    import {variableEditProvider} from "@perfice/main";
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import EditConstantOrVariable from "@perfice/components/variable/edit/EditConstantOrVariable.svelte";

    let {condition, onValueChange, onSidebar}: {
        condition: ComparisonGoalCondition,
        onValueChange: (v: ComparisonGoalCondition) => void,
        onSidebar: (v: GoalSidebarAction) => void
    } = $props();


    let editing: EditConstantOrVariableState | null = $state(null);
    let editStack: EditConstantOrVariableState[] = [];
    let editingSource: boolean = $state(false);

    let source = $derived(condition.getSource());
    let target = $derived(condition.getTarget());

    function onAddSource(constant: boolean, source: boolean) {
        if (constant) {
            let value = {constant: true, value: pNumber(0.0)};
            updateAndEditSourceOrTarget(value, source);
        } else {
            onSidebar({
                type: GoalSidebarActionType.ADD_SOURCE, value: {
                    onSourceSelected: (type: VariableTypeName) => {
                        let variable = variableEditProvider.createVariableFromType(type);
                        let value = {constant: false, value: pString(variable.id)};
                        updateAndEditSourceOrTarget(value, source);
                    }
                }
            });
        }
    }

    function updateAndEditSourceOrTarget(v: ConstantOrVariable, source: boolean) {
        onEdit({value: v, onChange: onSourceUpdate});
        editingSource = source;

        if (source) {
            onValueChange(new ComparisonGoalCondition(v, condition.getOperator(), condition.getTarget()));
        } else {
            onValueChange(new ComparisonGoalCondition(condition.getSource(), condition.getOperator(), v));
        }
    }

    function onChangeOperator(operator: ComparisonOperator) {
        onValueChange(new ComparisonGoalCondition(condition.getSource(), operator, condition.getTarget()));
    }

    function editSource(source: boolean) {
        let value = source ? condition.getSource() : condition.getTarget();
        if(value == null) return;

        onEdit({value, onChange: onSourceUpdate});
        editingSource = source;
    }

    function removeSource() {
        if(source == null) return;

        deleteSourceVariable(source);
        onValueChange(new ComparisonGoalCondition(null, condition.getOperator(), condition.getTarget()));
    }

    function removeTarget() {
        if(target == null) return;

        deleteSourceVariable(target);
        onValueChange(new ComparisonGoalCondition(condition.getSource(), condition.getOperator(), null));
    }

    function deleteSourceVariable(v: ConstantOrVariable){
        if (!v.constant && v.value.type == PrimitiveValueType.STRING) {
            variableEditProvider.deleteVariableAndDependencies(v.value.value);
        }
    }

    function onBack(){
        editStack.pop();
        editing = editStack.length > 0 ? editStack[editStack.length - 1] : null;
    }

    function onSourceUpdate(value: ConstantOrVariable){
        if (editingSource) {
            onValueChange(new ComparisonGoalCondition(value, condition.getOperator(), condition.getTarget()));
        } else {
            onValueChange(new ComparisonGoalCondition(condition.getSource(), condition.getOperator(), value));
        }
    }
    function onEditingChange(value: ConstantOrVariable){
        if(editing == null) return;
        editing.onChange(value);
    }

    function onEdit(value: EditConstantOrVariableState){
        editing = value;
        editStack.push(value);
    }
</script>

<div class="flex flex-col gap-2">
    {#if editing != null}
        <EditConstantOrVariable value={editing.value} onBack={onBack} onChange={onEditingChange} onEdit={onEdit} />
    {:else}
        {#if source != null }
            <GenericEditDeleteCard text={variableEditProvider.textForConstantOrVariable(source)} onEdit={() => editSource(true)}
                                   onDelete={removeSource}/>
        {:else}
            <AddSourceButton onAdd={(constant) => onAddSource(constant, true)}/>
        {/if}
        <BindableDropdownButton value={condition.getOperator()} items={COMPARISON_OPERATORS}
                                onChange={onChangeOperator}/>
        {#if target != null}
            <GenericEditDeleteCard text={variableEditProvider.textForConstantOrVariable(target)} onEdit={() => editSource(false)}
                                   onDelete={removeTarget}/>
        {:else}
            <AddSourceButton onAdd={(constant) => onAddSource(constant, false)}/>
        {/if}
    {/if}
</div>
