<script lang="ts">
    import {
        ComparisonGoalCondition,
        ComparisonOperator,
        type GoalCondition,
        GoalConditionType,
        GoalVariableType
    } from "@perfice/services/variable/types/goal";
    import TimeScopePicker from "@perfice/components/base/timeScope/TimeScopePicker.svelte";
    import type {TimeScope} from "@perfice/model/variable/time/time";
    import {type Form, isFormQuestionNumberRepresentable} from "@perfice/model/form/form";
    import NumberGoalCondition from "@perfice/components/goal/editor/number/NumberGoalCondition.svelte";
    import {pNumber, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import {variableEditProvider} from "@perfice/stores.js";
    import {VariableTypeName} from "@perfice/model/variable/variable";
    import {ListVariableType} from "@perfice/services/variable/types/list";
    import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";

    let {data, form, onChange}: {
        data: GoalVariableType,
        form: Form,
        onChange: (v: GoalVariableType) => void
    } = $props();

    function updateTimeScope(v: TimeScope) {
    }

    let questions = $derived(form.questions.filter(q => isFormQuestionNumberRepresentable(q.dataType)));

    let dropdownQuestions = $derived(questions?.map(v => {
        return {
            value: v.id,
            name: v.name,
        }
    }));

    function addCondition() {

        let fieldId = form.questions.length > 0 ? form.questions[0].id : "";
        let listVariableId = crypto.randomUUID();
        variableEditProvider.createVariable({
            id: listVariableId,
            name: "Goal condition",
            type: {
                type: VariableTypeName.LIST,
                value: new ListVariableType(form.id, {
                    [fieldId]: true
                }, [])
            }
        });

        let aggregateVariableId = crypto.randomUUID();
        variableEditProvider.createVariable({
            id: aggregateVariableId,
            name: "Goal condition",
            type: {
                type: VariableTypeName.AGGREGATE,
                value: new AggregateVariableType(AggregateType.MEAN, listVariableId, fieldId)
            }
        });

        onChange(
            new GoalVariableType(
                [...data.getConditions(), {
                    id: crypto.randomUUID(),
                    type: GoalConditionType.COMPARISON,
                    value: new ComparisonGoalCondition({
                        constant: false,
                        value: pString(aggregateVariableId)
                    }, ComparisonOperator.EQUAL, {
                        constant: true,
                        value: pNumber(0)
                    })
                }],
                data.getTimeScope()
            ),
        );
    }

    function onConditionChange(v: GoalCondition) {
        onChange(
            new GoalVariableType(
                data.getConditions().map(c => c.id == v.id ? v : c),
                data.getTimeScope()
            ),
        );
    }

    function removeCondition(condition: GoalCondition) {
        let source = (condition.value as ComparisonGoalCondition).getSource();
        if (source == null || source.value.type != PrimitiveValueType.STRING) return;

        variableEditProvider.deleteVariableAndDependencies(source.value.value,
            (v) => v.type.type != VariableTypeName.GOAL);
        onChange(
            new GoalVariableType(
                data.getConditions().filter(c => c.id != condition.id),
                data.getTimeScope()
            ),
        );
    }
</script>

<div class="flex flex-col gap-2 items-start">
    <div class="flex gap-2 items-center">
        <p class="block label">Conditions</p>

        <IconButton icon={faPlus} onClick={addCondition}/>
    </div>
    {#each data.getConditions() as condition(condition.id)}
        <NumberGoalCondition questions={form.questions} {dropdownQuestions} onChange={onConditionChange}
                             condition={condition} onRemove={() => removeCondition(condition)}/>
    {/each}

    <div class="inline-block px-4 md:px-0 w-full md:w-auto">
        <p class="block mb-2 label mt-4">Time scope</p>
        <TimeScopePicker value={data.getTimeScope()} onChange={updateTimeScope}/>
    </div>
</div>