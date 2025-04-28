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
    import {pNumber, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
    import {VariableTypeName} from "@perfice/model/variable/variable";
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import EditConstantOrVariable from "@perfice/components/variable/edit/EditConstantOrVariable.svelte";
    import {forms, variableEditProvider} from "@perfice/stores";
    import {FormQuestionDataType} from "@perfice/model/form/form";
    import {extractFormQuestionFromVariable} from "@perfice/stores/variable/edit";

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
    let dataType = $state(extractFirstDataType());

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
            condition = new ComparisonGoalCondition(v, condition.getOperator(), condition.getTarget());
            onValueChange(condition);
        } else {
            condition = new ComparisonGoalCondition(condition.getSource(), condition.getOperator(), v);
            onValueChange(condition);
        }
    }

    function onChangeOperator(operator: ComparisonOperator) {
        condition = new ComparisonGoalCondition(condition.getSource(), operator, condition.getTarget());
        onValueChange(condition);
    }

    function editSource(source: boolean) {
        let value = source ? condition.getSource() : condition.getTarget();
        if (value == null) return;

        onEdit({value, onChange: onSourceUpdate});
        editingSource = source;
    }

    function removeSource() {
        if (source == null) return;

        deleteSourceVariable(source);
        condition = new ComparisonGoalCondition(null, condition.getOperator(), condition.getTarget());
        onValueChange(condition);
    }

    function removeTarget() {
        if (target == null) return;

        deleteSourceVariable(target);
        condition = new ComparisonGoalCondition(condition.getSource(), condition.getOperator(), null)
        onValueChange(condition);
    }

    function deleteSourceVariable(v: ConstantOrVariable) {
        if (!v.constant && v.value.type == PrimitiveValueType.STRING) {
            variableEditProvider.deleteVariableAndDependencies(v.value.value,
                (v) => v.type.type != VariableTypeName.GOAL); // Don't delete goal met condition dependencies, that would delete a completely different goal
        }
    }

    function onBack() {
        dataType = extractFirstDataType();
        editStack.pop();
        editing = editStack.length > 0 ? editStack[editStack.length - 1] : null;
    }

    function onSourceUpdate(value: ConstantOrVariable) {
        if (editingSource) {
            condition = new ComparisonGoalCondition(value, condition.getOperator(), condition.getTarget());
            onValueChange(condition);
        } else {
            condition = new ComparisonGoalCondition(condition.getSource(), condition.getOperator(), value);
            onValueChange(condition);
        }
    }

    function onEditingChange(value: ConstantOrVariable) {
        if (editing == null) return;
        editing.value = value;
        editing.onChange(value);
    }

    function onEdit(value: EditConstantOrVariableState) {
        editing = value;
        editStack.push(value);
    }

    async function extractDataType(v: ConstantOrVariable): Promise<FormQuestionDataType | null> {
        if (v.constant || v.value.type != PrimitiveValueType.STRING) return null;

        let variable = variableEditProvider.getVariableById(v.value.value);
        if (variable == null) return null;

        return extractFormQuestionFromVariable(await forms.get(), variableEditProvider, variable)?.dataType ?? null;
    }


    async function extractFirstDataType() {
        if (source != null) {
            let extracted = await extractDataType(source);
            if (extracted != null) return extracted;
        }
        if (target != null) {
            let extracted = await extractDataType(target);
            if (extracted != null) return extracted;
        }

        return FormQuestionDataType.NUMBER;
    };
</script>

{#await dataType then dataType}
    <div class="flex flex-col gap-2">
        {#if editing != null}
            <EditConstantOrVariable {dataType} value={editing.value} onBack={onBack} onChange={onEditingChange}
                                    onEdit={onEdit}/>
        {:else}
            {#if source != null }
                <GenericEditDeleteCard text={variableEditProvider.textForConstantOrVariable(source, dataType)}
                                       onEdit={() => editSource(true)}
                                       onDelete={removeSource}/>
            {:else}
                <AddSourceButton onAdd={(constant) => onAddSource(constant, true)}/>
            {/if}
            <BindableDropdownButton value={condition.getOperator()} items={COMPARISON_OPERATORS}
                                    onChange={onChangeOperator}/>
            {#if target != null}
                <GenericEditDeleteCard text={variableEditProvider.textForConstantOrVariable(target, dataType)}
                                       onEdit={() => editSource(false)}
                                       onDelete={removeTarget}/>
            {:else}
                <AddSourceButton onAdd={(constant) => onAddSource(constant, false)}/>
            {/if}
        {/if}
    </div>
{/await}