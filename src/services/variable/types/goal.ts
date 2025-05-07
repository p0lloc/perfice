import {type VariableEvaluator, type VariableType, VariableTypeName} from "@perfice/model/variable/variable";
import {
    pBoolean,
    pComparisonResult,
    pMap,
    pNumber,
    type PrimitiveValue,
    PrimitiveValueType,
} from "@perfice/model/primitive/primitive";
import {type TimeScope, TimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";

export type GoalCondition = {
    id: string;
} & GoalConditionValues;

export interface ConstantOrVariable {
    value: PrimitiveValue;
    constant: boolean;
}

export type GoalConditionValues =
    GoalConditionDef<GoalConditionType.COMPARISON, ComparisonGoalCondition>
    | GoalConditionDef<GoalConditionType.GOAL_MET, GoalMetGoalCondition>;

export type GoalConditionDef<T extends GoalConditionType, V extends GoalConditionValue> = {
    type: T,
    value: V
}

export enum ComparisonOperator {
    EQUAL = "EQUAL",
    NOT_EQUAL = "NOT_EQUAL",
    GREATER_THAN = "GREATER_THAN",
    GREATER_THAN_EQUAL = "GREATER_THAN_EQUAL",
    LESS_THAN = "LESS_THAN",
    LESS_THAN_EQUAL = "LESS_THAN_EQUAL",
}

export class ComparisonGoalCondition implements GoalConditionValue {

    private readonly source: ConstantOrVariable | null;
    private readonly operator: ComparisonOperator;
    private readonly target: ConstantOrVariable | null;

    constructor(source: ConstantOrVariable | null, operator: ComparisonOperator, target: ConstantOrVariable | null) {
        this.source = source;
        this.operator = operator;
        this.target = target;
    }

    private async evaluateValue(value: ConstantOrVariable | null, evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        if (value == null) return pNumber(0.0);

        if (value.constant || value.value.type != PrimitiveValueType.STRING) {
            return value.value;
        }

        return evaluator.evaluateVariable(value.value.value);
    }

    private compareValues(source: PrimitiveValue, target: PrimitiveValue): boolean {
        if (source.type != PrimitiveValueType.NUMBER || target.type != PrimitiveValueType.NUMBER) return false;

        switch (this.operator) {
            case ComparisonOperator.EQUAL: {
                return source.value == target.value;
            }
            case ComparisonOperator.NOT_EQUAL: {
                return source.value != target.value;
            }
            case ComparisonOperator.GREATER_THAN: {
                return source.value > target.value;
            }
            case ComparisonOperator.GREATER_THAN_EQUAL: {
                return source.value >= target.value;
            }
            case ComparisonOperator.LESS_THAN: {
                return source.value < target.value;
            }
            case ComparisonOperator.LESS_THAN_EQUAL: {
                return source.value <= target.value;
            }
        }
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let sourceValue = await this.evaluateValue(this.source, evaluator);
        let targetValue = await this.evaluateValue(this.target, evaluator);

        return pComparisonResult(sourceValue, targetValue, this.compareValues(sourceValue, targetValue));
    }

    getDependencies(): string[] {
        let dependencies: string[] = [];
        if (this.source != null && !this.source.constant && this.source.value.type == PrimitiveValueType.STRING) {
            dependencies.push(this.source.value.value);
        }

        if (this.target != null && !this.target.constant && this.target.value.type == PrimitiveValueType.STRING) {
            dependencies.push(this.target.value.value);
        }

        return dependencies;
    }

    getSource(): ConstantOrVariable | null {
        return this.source;
    }

    getTarget(): ConstantOrVariable | null {
        return this.target;
    }

    getOperator(): ComparisonOperator {
        return this.operator;
    }

}

export class GoalMetGoalCondition implements GoalConditionValue {
    private readonly goalVariableId: string;

    constructor(goalVariableId: string) {
        this.goalVariableId = goalVariableId;
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let value = await evaluator.evaluateVariable(this.goalVariableId);

        if (value.type != PrimitiveValueType.MAP)
            return pBoolean(false);

        for (let result of Object.values(value.value)) {
            let bool = false;
            switch (result.type) {
                case PrimitiveValueType.BOOLEAN:
                    bool = result.value;
                    break;
                case PrimitiveValueType.COMPARISON_RESULT:
                    bool = result.value.met;
                    break;
            }

            if (!bool) return pBoolean(false);
        }

        return pBoolean(true);
    }

    getGoalVariableId(): string {
        return this.goalVariableId;
    }

    getDependencies(): string[] {
        return [this.goalVariableId];
    }
}

export enum GoalConditionType {
    COMPARISON = "COMPARISON",
    GOAL_MET = "GOAL_MET",
}

export function createGoalConditionValue(type: GoalConditionType): GoalConditionValue {
    switch (type) {
        case GoalConditionType.COMPARISON:
            return new ComparisonGoalCondition(null, ComparisonOperator.EQUAL, null);
        case GoalConditionType.GOAL_MET:
            return new GoalMetGoalCondition("");
    }
}

export interface GoalConditionValue {
    evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue>;

    getDependencies(): string[];
}

export function convertTimeScopeToGoalTimeScope(timeScope: TimeScope, goalTimeScope: TimeScope): TimeScope {
    if (goalTimeScope.type == TimeScopeType.SIMPLE && timeScope.type == TimeScopeType.SIMPLE) {
        // Override time scope to use same timestamp as passed in
        return tSimple(
            goalTimeScope.value.getType(),
            timeScope.value.getWeekStart(),
            timeScope.value.getTimestamp());
    }

    // Simply use the goal time scope, ignore anything else.
    return goalTimeScope;
}

export function getDummyWeekStartForGoal(): WeekStart {
    // Goal values are always evaluated with the passed in week start, the
    // week start stored in the time scope is just a dummy value.
    return WeekStart.MONDAY;
}

export class GoalVariableType implements VariableType {

    private readonly conditions: GoalCondition[];
    private readonly timeScope: TimeScope;

    constructor(conditions: GoalCondition[], timeScope: TimeScope) {
        this.conditions = conditions;
        this.timeScope = timeScope;
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let newEvaluator = evaluator.overrideTimeScope(
            convertTimeScopeToGoalTimeScope(evaluator.getTimeScope(), this.timeScope));

        let result: Record<string, PrimitiveValue> = {};
        for (let condition of this.conditions) {
            result[condition.id] = await condition.value.evaluate(newEvaluator);
        }

        return pMap(result);
    }

    getDependencies(): string[] {
        return Array.from(new Set(this.conditions.flatMap(c => c.value.getDependencies())));
    }

    getType(): VariableTypeName {
        return VariableTypeName.GOAL;
    }

    getTimeScope(): TimeScope {
        return this.timeScope;
    }

    getConditions(): GoalCondition[] {
        return this.conditions;
    }

}
