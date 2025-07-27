<script lang="ts">
    import {
        ComparisonGoalCondition,
        ComparisonOperator,
        type GoalCondition,
        GoalConditionType
    } from "@perfice/services/variable/types/goal";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";
    import {COMPARISON_OPERATORS} from "@perfice/model/goal/ui";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {FormQuestion} from "@perfice/model/form/form";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {AGGREGATE_TYPES} from "@perfice/model/variable/ui";
    import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
    import {variableEditProvider} from "@perfice/stores";
    import {VariableTypeName} from "@perfice/model/variable/variable";
    import {ListVariableType} from "@perfice/services/variable/types/list";
    import EditConstant from "@perfice/components/variable/edit/EditConstant.svelte";

    let {condition, questions, dropdownQuestions, onChange, onRemove}: {
        condition: GoalCondition,
        questions: FormQuestion[],
        dropdownQuestions: DropdownMenuItem<string>[],
        onChange: (v: GoalCondition) => void,
        onRemove: () => void
    } = $props();

    let comparison = $derived(condition.value as ComparisonGoalCondition);
    let source = $derived((condition.value as ComparisonGoalCondition).getSource()!);
    let target = $derived((condition.value as ComparisonGoalCondition).getTarget()!);

    let sourceValue = $derived(source.value.value as string);
    let aggregateVariable = $derived(variableEditProvider.getVariableById(sourceValue));

    function onSourceChange(fieldId: string) {
        let aggregateVariable = variableEditProvider.getVariableById(source.value.value as string);
        if (aggregateVariable == null || aggregateVariable.type.type != VariableTypeName.AGGREGATE) return;

        let listVariable = variableEditProvider.getVariableById(aggregateVariable.type.value.getListVariableId());
        if (listVariable == null || listVariable.type.type != VariableTypeName.LIST) return;

        aggregateVariable.type.value = new AggregateVariableType(AggregateType.MEAN, listVariable.id, fieldId);
        listVariable.type.value = new ListVariableType(listVariable.type.value.getFormId(), {
            [fieldId]: true
        }, []);

        variableEditProvider.updateVariable(listVariable);
        variableEditProvider.updateVariable(aggregateVariable);
    }

    function onOperatorChange(v: ComparisonOperator) {
        onChange({
            id: condition.id,
            type: GoalConditionType.COMPARISON,
            value: new ComparisonGoalCondition(source, v, target)
        });
    }

    function onTargetChange(v: PrimitiveValue) {
        onChange({
            id: condition.id,
            type: GoalConditionType.COMPARISON,
            value: new ComparisonGoalCondition(source, comparison.getOperator(), {
                constant: true,
                value: v
            })
        });
    }

    function onAggregateTypeChange(aggregateType: AggregateType) {
        let aggregateVariable = variableEditProvider.getVariableById(source.value.value as string);
        if (aggregateVariable == null || aggregateVariable.type.type != VariableTypeName.AGGREGATE) return;

        aggregateVariable.type.value = new AggregateVariableType(aggregateType,
            aggregateVariable.type.value.getListVariableId(), aggregateVariable.type.value.getField());
        variableEditProvider.updateVariable(aggregateVariable);
    }

    let selectedQuestion = $derived(questions.find(q => q.id == (aggregateVariable!.type.value as AggregateVariableType).getField())!);
</script>

<div class="flex gap-2 flex-wrap items-center">
    <DropdownButton items={AGGREGATE_TYPES} value={AggregateType.MEAN} onChange={onAggregateTypeChange}/>

    <DropdownButton items={dropdownQuestions} value={selectedQuestion.id} onChange={onSourceChange}/>

    <DropdownButton value={comparison.getOperator()} items={COMPARISON_OPERATORS}
                    onChange={onOperatorChange}/>

    <EditConstant value={target.value} onChange={onTargetChange} dataType={selectedQuestion.dataType}/>
    <IconButton icon={faTrash} onClick={onRemove}/>
</div>
