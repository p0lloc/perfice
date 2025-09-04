import {
    ComparisonGoalCondition,
    ComparisonOperator,
    type ConstantOrVariable,
    getDummyWeekStartForGoal,
    type GoalCondition,
    GoalConditionType,
    GoalMetGoalCondition,
    GoalVariableType
} from "@perfice/services/variable/types/goal";
import {type Variable, type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {deserializeTimeScope, serializeTimeScope} from "@perfice/model/variable/time/serialization";
import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {GoalService} from "@perfice/services/goal/goal";
import type {VariableService} from "@perfice/services/variable/variable";
import type {Goal} from "@perfice/model/goal/goal";
import {pNumber, pString} from "@perfice/model/primitive/primitive";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {createDefaultWeekDays, GoalStreakVariableType} from "@perfice/services/variable/types/goalStreak";

export interface GoalSuggestion {
    name: string;
    color: string;
    conditions: GoalConditionValues[];
    timeScope: string;
}

export function createVariableSuggestion(suggestion: VariableSuggestion,
                                         assignedForms: Map<string, string>,
                                         assignedQuestions: Map<string, string>,
                                         assignedVariables: Map<string, string>
): VariableTypeDef {

    switch (suggestion.type) {
        case VariableTypeName.LIST: {
            let formId = assignedForms.get(suggestion.value.formId) ?? suggestion.value.formId;
            let fields = Object.fromEntries(Object.entries(suggestion.value.fields)
                .map(([key, value]) => [assignedQuestions.get(key) ?? key, value]));

            return {type: VariableTypeName.LIST, value: new ListVariableType(formId, fields, [])};
        }
        case VariableTypeName.AGGREGATE: {
            let listVariableId = assignedVariables.get(suggestion.value.listVariableId) ?? suggestion.value.listVariableId;
            let aggregateType = suggestion.value.aggregateType;
            let field = assignedQuestions.get(suggestion.value.field) ?? suggestion.value.field;

            return {
                type: VariableTypeName.AGGREGATE,
                value: new AggregateVariableType(aggregateType, listVariableId, field)
            };
        }
    }
}

export async function createConstantOrVariableSuggestion(suggestion: ConstantOrVariableSuggestion, variableService: VariableService,
                                                         assignedForms: Map<string, string>,
                                                         assignedQuestions: Map<string, string>
): Promise<ConstantOrVariable> {
    if (suggestion.constant) {
        return {
            value: pNumber(suggestion.value),
            constant: true
        }
    } else {
        let assignedVariables: Map<string, string> = new Map();
        for (let variable of suggestion.variables) {
            let def = createVariableSuggestion(variable, assignedForms, assignedQuestions, assignedVariables);
            let variableId = crypto.randomUUID();
            assignedVariables.set(variable.id, variableId);

            await variableService.createVariable({
                id: variableId,
                name: "",
                type: def
            });
        }

        return {
            value: pString(assignedVariables.get(suggestion.value) ?? suggestion.value),
            constant: false,
        }
    }
}

export async function createGoalSuggestion(suggestion: GoalSuggestion, goalService: GoalService,
                                           variableService: VariableService,
                                           assignedForms: Map<string, string>,
                                           assignedQuestions: Map<string, string>,
                                           assignedGoals: Map<string, string>): Promise<Goal> {

    let conditions: GoalCondition[] = [];
    for (let condition of suggestion.conditions) {
        switch (condition.type) {
            case GoalConditionType.COMPARISON: {
                let source = await createConstantOrVariableSuggestion(condition.value.source, variableService, assignedForms, assignedQuestions);
                let target = await createConstantOrVariableSuggestion(condition.value.target, variableService, assignedForms, assignedQuestions);

                conditions.push({
                    id: crypto.randomUUID(),
                    type: GoalConditionType.COMPARISON,
                    value: new ComparisonGoalCondition(source, condition.value.operator, target)
                });
                break;
            }
            case GoalConditionType.GOAL_MET: {
                conditions.push({
                    id: crypto.randomUUID(),
                    type: GoalConditionType.GOAL_MET,
                    value: new GoalMetGoalCondition(assignedGoals.get(condition.value.goal) ?? condition.value.goal)
                });
            }
        }
    }

    let variable: Variable = {
        id: crypto.randomUUID(),
        name: suggestion.name,
        type: {
            type: VariableTypeName.GOAL,
            value: new GoalVariableType(conditions, deserializeTimeScope(suggestion.timeScope, WeekStart.MONDAY))
        }
    };

    await variableService.createVariable(variable);

    let streakVariable: Variable = {
        id: crypto.randomUUID(),
        name: suggestion.name,
        type: {
            type: VariableTypeName.GOAL_STREAK,
            value: new GoalStreakVariableType(variable.id, createDefaultWeekDays())
        }
    };

    await variableService.createVariable(streakVariable);

    return goalService.createGoal(suggestion.name, suggestion.color, variable, streakVariable);
}

export const GOAL_SUGGESTIONS: GoalSuggestion[] = [
    {
        name: "Daily steps",
        color: "#ff0000",
        conditions: [
            {
                type: GoalConditionType.COMPARISON,
                value: {
                    source: {
                        constant: false,
                        value: "aggregate",
                        variables: [
                            {
                                id: "list",
                                type: VariableTypeName.LIST,
                                value: {
                                    formId: "Steps",
                                    fields: {"count": true}
                                }
                            },
                            {
                                id: "aggregate",
                                type: VariableTypeName.AGGREGATE,
                                value: {
                                    aggregateType: AggregateType.SUM,
                                    listVariableId: "list",
                                    field: "count"
                                }
                            }
                        ]
                    },
                    operator: ComparisonOperator.GREATER_THAN_EQUAL,
                    target: {
                        constant: true,
                        value: 5000
                    }
                }
            }
        ],
        timeScope: serializeTimeScope(tSimple(SimpleTimeScopeType.DAILY, getDummyWeekStartForGoal(), 0))
    },
    {
        name: "Good sleep",
        color: "#ff0000",
        conditions: [
            {
                type: GoalConditionType.COMPARISON,
                value: {
                    source: {
                        constant: false,
                        value: "aggregate",
                        variables: [
                            {
                                id: "list",
                                type: VariableTypeName.LIST,
                                value: {
                                    formId: "Sleep",
                                    fields: {"duration": true}
                                }
                            },
                            {
                                id: "aggregate",
                                type: VariableTypeName.AGGREGATE,
                                value: {
                                    aggregateType: AggregateType.SUM,
                                    listVariableId: "list",
                                    field: "duration"
                                }
                            }
                        ]
                    },
                    operator: ComparisonOperator.GREATER_THAN_EQUAL,
                    target: {
                        constant: true,
                        value: 450
                    }
                }
            }
        ],
        timeScope: serializeTimeScope(tSimple(SimpleTimeScopeType.DAILY, getDummyWeekStartForGoal(), 0))
    },
    {
        name: "Healthy day",
        color: "#ff0000",
        conditions: [
            {
                type: GoalConditionType.GOAL_MET,
                value: {
                    goal: "Daily steps",
                }
            },
            {
                type: GoalConditionType.GOAL_MET,
                value: {
                    goal: "Good sleep",
                }
            }
        ],
        timeScope: serializeTimeScope(tSimple(SimpleTimeScopeType.DAILY, getDummyWeekStartForGoal(), 0))
    }
];

export type GoalConditionValues =
    GCD<GoalConditionType.COMPARISON, ComparisonGoalConditionSuggestion>
    | GCD<GoalConditionType.GOAL_MET, GoalMetGoalConditionSuggestion>;

export type GCD<T extends GoalConditionType, V> = {
    type: T,
    value: V
}

export type ConstantOrVariableSuggestion = {
    value: number;
    constant: true;
} | {
    value: string;
    constant: false;
    variables: VariableSuggestion[];
}

export interface ComparisonGoalConditionSuggestion {
    source: ConstantOrVariableSuggestion;
    operator: ComparisonOperator;
    target: ConstantOrVariableSuggestion;
}

export type VariableSuggestion = {
    id: string
} & VariableValues;

export type VariableValues = VS<VariableTypeName.LIST, ListVariableSuggestion>
    | VS<VariableTypeName.AGGREGATE, AggregateVariableSuggestion>;

export interface ListVariableSuggestion {
    formId: string;
    fields: Record<string, boolean>;
}

export interface AggregateVariableSuggestion {
    aggregateType: AggregateType;
    listVariableId: string;
    field: string;
}

export type VS<T extends VariableTypeName, V> = {
    type: T,
    value: V
}


export interface GoalMetGoalConditionSuggestion {
    goal: string;
}
