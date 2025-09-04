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
    import {type FormQuestion, FormQuestionDataType, isFormQuestionNumberRepresentable} from "@perfice/model/form/form";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {AGGREGATE_TYPES} from "@perfice/model/variable/ui";
    import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
    import {variableEditProvider} from "@perfice/stores";
    import {VariableTypeName} from "@perfice/model/variable/variable";
    import {ListVariableType} from "@perfice/services/variable/types/list";
    import EditConstant from "@perfice/components/variable/edit/EditConstant.svelte";

    let {condition, questions, onChange, onRemove}: {
        condition: GoalCondition,
        questions: FormQuestion[],
        onChange: (v: GoalCondition) => void,
        onRemove: () => void
    } = $props();

    let comparison = $derived(condition.value as ComparisonGoalCondition);
    let source = $state((condition.value as ComparisonGoalCondition).getSource()!);
    let target = $state((condition.value as ComparisonGoalCondition).getTarget()!);

    let sourceValue = $derived(source.value.value as string);
    let aggregateVariable = $state(variableEditProvider.getVariableById(sourceValue));

    function onSourceChange(fieldId: string) {
        let aggr = variableEditProvider.getVariableById(source.value.value as string);
        if (aggr == null || aggr.type.type != VariableTypeName.AGGREGATE) return;

        let listVariable = variableEditProvider.getVariableById(aggr.type.value.getListVariableId());
        if (listVariable == null || listVariable.type.type != VariableTypeName.LIST) return;

        aggregateVariable = {
            ...aggr,
            type: {
                ...aggr.type,
                value: new AggregateVariableType(aggr.type.value.getAggregateType(), listVariable.id, fieldId)
            }
        }
        listVariable.type.value = new ListVariableType(listVariable.type.value.getFormId(), {
            [fieldId]: true
        }, []);

        variableEditProvider.updateVariable(listVariable);
        updateAggregationVariable();
    }

    function onOperatorChange(v: ComparisonOperator) {
        onChange({
            id: condition.id,
            type: GoalConditionType.COMPARISON,
            value: new ComparisonGoalCondition($state.snapshot(source), v, $state.snapshot(target))
        });
    }

    function onTargetChange(v: PrimitiveValue) {
        let primitive = {
            constant: true,
            value: v
        };

        onChange({
            id: condition.id,
            type: GoalConditionType.COMPARISON,
            value: new ComparisonGoalCondition($state.snapshot(source), comparison.getOperator(), primitive)
        });

        target = primitive;
    }

    function onAggregateTypeChange(aggregateType: AggregateType) {
        let aggr = variableEditProvider.getVariableById(source.value.value as string);
        if (aggr == null || aggr.type.type != VariableTypeName.AGGREGATE) return;

        aggregateVariable = {
            ...aggr,
            type: {
                ...aggr.type,
                value: new AggregateVariableType(aggregateType,
                    aggr.type.value.getListVariableId(), aggr.type.value.getField())
            }
        }

        updateAggregationVariable();
    }

    function updateAggregationVariable() {
        if (aggregateVariable == null || aggregateVariable.type.type != VariableTypeName.AGGREGATE) return;

        variableEditProvider.updateVariable({
            id: aggregateVariable.id,
            name: aggregateVariable.name,
            type: {
                type: VariableTypeName.AGGREGATE,
                value: new AggregateVariableType(aggregateType,
                    aggregateVariable.type.value.getListVariableId(), aggregateVariable.type.value.getField())
            }
        });
    }

    let availableQuestions = $derived.by<DropdownMenuItem<string>[]>(() => {
        let available: DropdownMenuItem<string>[] = [];
        for (let question of questions) {
            if (aggregateType != AggregateType.COUNT && !isFormQuestionNumberRepresentable(question.dataType)) continue;

            available.push({
                value: question.id,
                name: question.name,
            });
        }

        return available;
    });

    function showQuestionPicker(availableQuestions: DropdownMenuItem<string>[], aggregateType: AggregateType) {
        if (availableQuestions.length == 0) return false;
        return aggregateType != AggregateType.COUNT;
    }

    let aggregateType = $derived((aggregateVariable?.type.value as AggregateVariableType).getAggregateType() ?? AggregateType.MEAN);
    let selectedQuestion = $derived(questions.find(q => q.id == (aggregateVariable!.type.value as AggregateVariableType).getField())!);

    let supportedAggregateTypes = $derived.by(() => {
        if (availableQuestions.length == 0)
            return [AGGREGATE_TYPES.find(t => t.value == AggregateType.COUNT)];

        return AGGREGATE_TYPES;
    })
</script>

<div class="flex gap-2 flex-wrap items-center">
    <DropdownButton items={supportedAggregateTypes} value={aggregateType} onChange={onAggregateTypeChange}
                    class="w-full md:w-auto"/>

    {#if showQuestionPicker(availableQuestions, aggregateType)}
        <DropdownButton items={availableQuestions} value={selectedQuestion.id} onChange={onSourceChange}
                        class="w-full md:w-auto flex-1"/>
    {/if}

    <DropdownButton value={comparison.getOperator()} items={COMPARISON_OPERATORS}
                    onChange={onOperatorChange}
                    class="w-full md:w-auto"
    />

    <EditConstant value={target.value} onChange={onTargetChange}
                  dataType={aggregateType !== AggregateType.COUNT ? selectedQuestion.dataType : FormQuestionDataType.NUMBER}/>
    <IconButton icon={faTrash} onClick={onRemove}/>
</div>
