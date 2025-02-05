<script lang="ts">
    import {
        ComparisonGoalCondition,
        ComparisonOperator,
        type ConstantOrVariable
    } from "@perfice/services/variable/types/goal";
    import {COMPARISON_OPERATORS, type GoalSidebarAction, GoalSidebarActionType} from "@perfice/model/goal/ui";
    import AddSourceButton from "@perfice/components/goal/editor/condition/AddSourceButton.svelte";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {pNumber, pString} from "@perfice/model/primitive/primitive";
    import type {VariableTypeName} from "@perfice/model/variable/variable";
    import {variableEditProvider} from "@perfice/main";

    let {condition, onValueChange, onSidebar}: {
        condition: ComparisonGoalCondition,
        onValueChange: (v: ComparisonGoalCondition) => void,
        onSidebar: (v: GoalSidebarAction) => void
    } = $props();


    let editing: ConstantOrVariable | null = $state(null);
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
</script>

<div class="flex flex-col gap-2">
    {#if editing != null}
    {:else}
        {#if source != null }
        {:else}
            <AddSourceButton onAdd={(constant) => onAddSource(constant, true)}/>
        {/if}
        <BindableDropdownButton value={condition.getOperator()} items={COMPARISON_OPERATORS}
                                onChange={onChangeOperator}/>
        {#if target != null}
        {:else}
            <AddSourceButton onAdd={(constant) => onAddSource(constant, false)}/>
        {/if}
    {/if}
</div>
