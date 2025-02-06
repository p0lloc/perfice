<script lang="ts">
    import {
        ComparisonGoalCondition,
        ComparisonOperator,
        type ConstantOrVariable
    } from "@perfice/services/variable/types/goal";
    import {COMPARISON_OPERATORS, type GoalSidebarAction, GoalSidebarActionType} from "@perfice/model/goal/ui";
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


    let editing: ConstantOrVariable | null = $state(null);
    let editingSource: boolean = $state(false);

    let source = $derived(condition.getSource());
    let target = $derived(condition.getTarget());

    function onAddSource(constant: boolean, source: boolean) {
        if (constant) {
            let value = {constant: true, value: pNumber(0.0)};
            updateSourceOrTarget(value, source);
        } else {
            onSidebar({
                type: GoalSidebarActionType.ADD_SOURCE, value: {
                    onSourceSelected: (type: VariableTypeName) => {
                        let variable = variableEditProvider.createVariableFromType(type);
                        let value = {constant: false, value: pString(variable.id)};
                        updateSourceOrTarget(value, source);
                    }
                }
            });
        }
    }

    function updateSourceOrTarget(v: ConstantOrVariable, source: boolean) {
        if (source) {
            onValueChange(new ComparisonGoalCondition(v, condition.getOperator(), condition.getTarget()));
        } else {
            onValueChange(new ComparisonGoalCondition(condition.getSource(), condition.getOperator(), v));
        }
    }

    function onChangeOperator(operator: ComparisonOperator) {
        onValueChange(new ComparisonGoalCondition(condition.getSource(), operator, condition.getTarget()));
    }

    function textForConstantOrVariable(v: ConstantOrVariable): string {
        if (v.constant || v.value.type != PrimitiveValueType.STRING) {
            return prettyPrintPrimitive(v.value);
        }

        let variable = variableEditProvider.getVariableById(v.value.value);
        if (variable == null) return "Unknown source";

        return variable.name;
    }

    function editSource(source: boolean) {
        editingSource = source;
        editing = source ? condition.getSource() : condition.getTarget();
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
        editing = null;
    }

    function onEditingChange(value: ConstantOrVariable){
        if (editingSource) {
            onValueChange(new ComparisonGoalCondition(value, condition.getOperator(), condition.getTarget()));
        } else {
            onValueChange(new ComparisonGoalCondition(condition.getSource(), condition.getOperator(), value));
        }
    }
</script>

<div class="flex flex-col gap-2">
    {#if editing != null}
        <EditConstantOrVariable value={editing} onBack={onBack} onChange={onEditingChange} />
    {:else}
        {#if source != null }
            <GenericEditDeleteCard text={textForConstantOrVariable(source)} onEdit={() => editSource(true)}
                                   onDelete={removeSource}/>
        {:else}
            <AddSourceButton onAdd={(constant) => onAddSource(constant, true)}/>
        {/if}
        <BindableDropdownButton value={condition.getOperator()} items={COMPARISON_OPERATORS}
                                onChange={onChangeOperator}/>
        {#if target != null}
            <GenericEditDeleteCard text={textForConstantOrVariable(target)} onEdit={() => editSource(false)}
                                   onDelete={removeTarget}/>
        {:else}
            <AddSourceButton onAdd={(constant) => onAddSource(constant, false)}/>
        {/if}
    {/if}
</div>
