import {SimpleTimeScopeType, type TimeScope, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, readable, type Readable} from "svelte/store";
import {prettyPrintPrimitive, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {VariableValueStore} from "@perfice/stores/variable/value";
import type {Goal} from "@perfice/model/goal/goal";
import {
    ComparisonOperator,
    convertTimeScopeToGoalTimeScope,
    type GoalCondition,
    GoalConditionType
} from "@perfice/services/variable/types/goal";
import {VariableTypeName} from "@perfice/model/variable/variable";
import {emptyPromise} from "@perfice/util/promise";
import {type Form, FormQuestionDataType} from "@perfice/model/form/form";
import {extractFormQuestionFromVariable} from "@perfice/stores/variable/edit";
import {forms} from "@perfice/stores";
import {formatValueAsDataType} from "@perfice/model/form/data";
import {GOAL_STREAK_TIME_SCOPE} from "@perfice/services/variable/types/goalStreak";

export type GoalConditionValueResult =
    GV<GoalConditionType.GOAL_MET, GoalMetValueResult>
    | GV<GoalConditionType.COMPARISON, ComparisonValueResult>;

export interface ComparisonValueResult {
    name: string;
    source: PrimitiveValue;
    dataType: FormQuestionDataType;
    unit: string | null;
    operator: ComparisonOperator;
    target: PrimitiveValue;
    met: boolean;
}

export interface GoalMetValueResult {
    name: string;
    met: boolean;
}

export interface GV<K extends GoalConditionType, V> {
    type: K;
    value: V;
}

function extractNameAndDataTypeFromDependencies(dependencies: string[], forms: Form[], variableService: VariableService): {
    name: string,
    dataType: FormQuestionDataType,
    unit: string | null
} {
    let name = "Goal";
    let dataType = FormQuestionDataType.NUMBER;
    if (dependencies.length > 0) {
        for (let dependency of dependencies) {
            let variable = variableService.getVariableById(dependency);
            if (variable == null) continue;

            let question = extractFormQuestionFromVariable(forms, variableService, variable);
            if (question == null)
                continue;

            return {name: variable.name, dataType: question.dataType, unit: question.unit};
        }
    }

    return {name, dataType, unit: null};
}

function mapGoalResult(resultMap: Record<string, PrimitiveValue>, condition: GoalCondition,
                       variableService: VariableService, forms: Form[]): GoalConditionValueResult | null {
    let result = resultMap[condition.id];
    if (result == null) return null;

    switch (condition.type) {
        case GoalConditionType.COMPARISON: {
            if (result.type != PrimitiveValueType.COMPARISON_RESULT) return null;

            let {
                name,
                dataType,
                unit
            } = extractNameAndDataTypeFromDependencies(condition.value.getDependencies(), forms, variableService);

            return {
                type: GoalConditionType.COMPARISON,
                value: {
                    name: name,
                    source: result.value.source,
                    dataType,
                    unit,
                    operator: condition.value.getOperator(),
                    target: result.value.target,
                    met: result.value.met,
                }
            }
        }
        case GoalConditionType.GOAL_MET: {
            if (result.type != PrimitiveValueType.BOOLEAN) return null;

            let variable = variableService.getVariableById(condition.value.getGoalVariableId());
            if (variable == null) return null;

            return {
                type: GoalConditionType.GOAL_MET,
                value: {
                    name: variable.name,
                    met: result.value,
                }
            }
        }
    }
}

export interface GoalValueResult {
    timeScope: TimeScope;
    results: GoalConditionValueResult[];
    streak: PrimitiveValue;
}

export function GoalValueStore(variableId: string, streakVariableId: string, date: Date,
                               weekStart: WeekStart, key: string, variableService: VariableService): Readable<Promise<GoalValueResult>> {

    let goalVariable = variableService.getVariableById(variableId);
    if (goalVariable == null || goalVariable.type.type != VariableTypeName.GOAL)
        return readable(emptyPromise());

    let goalData = goalVariable.type.value;

    let timeScope = tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime());
    // Time scope needs to be converted to match the one set in the goal
    // otherwise we will get an incorrect "DAILY" time scope for RANGED/FOREVER time scopes.
    let convertedTimeScope = convertTimeScopeToGoalTimeScope(timeScope, goalData.getTimeScope());

    let goalValueStore = VariableValueStore(variableId, convertedTimeScope, variableService, key);
    let goalStreakStore = VariableValueStore(streakVariableId, GOAL_STREAK_TIME_SCOPE, variableService, key + ":streak");

    return derived([goalValueStore, goalStreakStore], ([value, streak], set) => {
        set(new Promise(async (resolve) => {
            let resolved = await value;
            if (resolved.type != PrimitiveValueType.MAP) return;

            let streakValue = await streak;

            let availableForms = await forms.get();

            let resultMap = resolved.value;
            let results: GoalConditionValueResult[] = [];
            let conditions = goalData.getConditions();
            for (let condition of conditions) {
                let result = mapGoalResult(resultMap, condition, variableService, availableForms);
                if (result == null) continue;

                results.push(result);
            }

            resolve({timeScope: goalData.getTimeScope(), results, streak: streakValue});
        }));
    }, emptyPromise());
}


export function formatComparisonNumberValues(first: number, second: number, dataType: FormQuestionDataType, unit: string | null): string {
    let firstFormatted = formatValueAsDataType(first, dataType);
    let secondFormatted = formatValueAsDataType(second, dataType);

    return `${firstFormatted} of ${secondFormatted}${unit != null ? " " + unit : ""}`;
}

export function formatComparisonNonNumberValues(result: ComparisonValueResult): string {
    return `${prettyPrintPrimitive(result.source)} ${result.operator} ${prettyPrintPrimitive(result.target)}`;
}
