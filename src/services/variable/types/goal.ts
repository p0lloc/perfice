import {
    type ExpandedVariable,
    type ExpandedVariableType, expandVariable,
    type VariableEvaluator,
    type VariableType,
    VariableTypeName
} from "@perfice/model/variable/variable";
import {
    pBoolean,
    pComparisonResult,
    pMap,
    type PrimitiveValue,
    PrimitiveValueType, pString
} from "@perfice/model/primitive/primitive";
import {type TimeScope, TimeScopeType} from "@perfice/model/variable/time/time";
import {type FormService} from "@perfice/services/form/form";
import {type VariableGraph} from "@perfice/services/variable/graph";

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


export type ExpandedGoalConditionValues =
    ExpandedGoalConditionDef<GoalConditionType.COMPARISON, ExpandedComparisonGoalCondition>
    | ExpandedGoalConditionDef<GoalConditionType.GOAL_MET, ExpandedGoalMetGoalCondition>;


export type GoalConditionDef<T extends GoalConditionType, V extends GoalConditionValue> = {
    type: T,
    value: V
}


export type ExpandedGoalConditionDef<T extends GoalConditionType, V extends ExpandedGoalConditionValue> = {
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

export type ExpandedConstantOrVariable = {
    value: PrimitiveValue,
    constant: true,
} | {
    value: ExpandedVariable,
    constant: false,
}

export class ExpandedComparisonGoalCondition implements ExpandedGoalConditionValue {
    private readonly source: ExpandedConstantOrVariable;
    private readonly operator: ComparisonOperator;
    private readonly target: ExpandedConstantOrVariable;

    constructor(source: ExpandedConstantOrVariable, operator: ComparisonOperator, target: ExpandedConstantOrVariable) {
        this.source = source;
        this.operator = operator;
        this.target = target;
    }

    private shrinkConstantOrVariable(v: ExpandedConstantOrVariable): ConstantOrVariable {
        if (v.constant) {
            return {
                value: v.value,
                constant: true
            }
        }

        return {
            value: pString(v.value.id), // Variable ID of expanded variable
            constant: false
        };
    }

    shrink(): GoalConditionValue {
        return new ComparisonGoalCondition(this.shrinkConstantOrVariable(this.source),
            this.operator, this.shrinkConstantOrVariable(this.target));
    }
}

export class ComparisonGoalCondition implements GoalConditionValue {

    private readonly source: ConstantOrVariable;
    private readonly operator: ComparisonOperator;
    private readonly target: ConstantOrVariable;

    constructor(source: ConstantOrVariable, operator: ComparisonOperator, target: ConstantOrVariable) {
        this.source = source;
        this.operator = operator;
        this.target = target;
    }

    private async evaluateValue(value: ConstantOrVariable, evaluator: VariableEvaluator): Promise<PrimitiveValue> {
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
        if (!this.source.constant && this.source.value.type == PrimitiveValueType.STRING) {
            dependencies.push(this.source.value.value);
        }

        if (!this.target.constant && this.target.value.type == PrimitiveValueType.STRING) {
            dependencies.push(this.target.value.value);
        }

        return dependencies;
    }

    private async expandValue(value: ConstantOrVariable, graph: VariableGraph, formService: FormService): Promise<ExpandedConstantOrVariable | null> {
        if (value.constant || value.value.type != PrimitiveValueType.STRING) {
            return {
                value: value.value,
                constant: true
            };
        }

        let variable = graph.getVariableById(value.value.value);
        if (variable == null) return null;
        let expanded = await expandVariable(variable, graph, formService);
        if (expanded == null) return null;

        return {
            value: expanded,
            constant: false
        };
    }

    async expand(graph: VariableGraph, formService: FormService): Promise<ExpandedGoalConditionValue | null> {
        let sourceExpanded = await this.expandValue(this.source, graph, formService);
        if (sourceExpanded == null) return null;

        let targetExpanded = await this.expandValue(this.target, graph, formService);
        if (targetExpanded == null) return null;

        return new ExpandedComparisonGoalCondition(sourceExpanded, this.operator, targetExpanded);
    }

    getSource(): ConstantOrVariable {
        return this.source;
    }

    getTarget(): ConstantOrVariable {
        return this.target;
    }

    getOperator(): ComparisonOperator {
        return this.operator;
    }

}

export class ExpandedGoalMetGoalCondition implements ExpandedGoalConditionValue {
    // TODO: actually expand this to its goal variable
    private readonly goalVariableId: string;

    constructor(goalVariableId: string) {
        this.goalVariableId = goalVariableId;
    }

    shrink(): GoalConditionValue {
        return new GoalMetGoalCondition(this.goalVariableId);
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

    getDependencies(): string[] {
        return [this.goalVariableId];
    }

    async expand(graph: VariableGraph, formService: FormService): Promise<ExpandedGoalConditionValue | null> {
        return new ExpandedGoalMetGoalCondition(this.goalVariableId);
    }

}

export enum GoalConditionType {
    COMPARISON = "COMPARISON",
    GOAL_MET = "GOAL_MET",
}

export interface ExpandedGoalConditionValue {
    shrink(): GoalConditionValue;
}

export interface GoalConditionValue {
    evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue>;

    getDependencies(): string[];

    expand(graph: VariableGraph, formService: FormService): Promise<ExpandedGoalConditionValue | null>;
}


export type ExpandedGoalCondition = {
    id: string;
} & ExpandedGoalConditionValues;

export class ExpandedGoalVariableType implements ExpandedVariableType {

    private readonly conditions: ExpandedGoalCondition[];
    private readonly timeScope: TimeScope;

    constructor(conditions: ExpandedGoalCondition[], timeScope: TimeScope) {
        this.conditions = conditions;
        this.timeScope = timeScope;
    }

    shrink(): VariableType {
        let conditions: GoalCondition[] = [];
        for (let condition of this.conditions) {
            conditions.push({
                id: condition.id,
                type: condition.type,
                // @ts-ignore
                value: condition.value.shrink()
            });
        }

        return new GoalVariableType(conditions, this.timeScope);
    }
}

export class GoalVariableType implements VariableType {

    private readonly conditions: GoalCondition[];
    private readonly timeScope: TimeScope;

    constructor(conditions: GoalCondition[], timeScope: TimeScope) {
        this.conditions = conditions;
        this.timeScope = timeScope;
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let newEvaluator = evaluator;
        if (this.timeScope.type != TimeScopeType.SIMPLE) {
            // If time scope is not simple, we use the time scope specified here.
            // This allows us to override the time scope for RANGED / FOREVER time scopes that don't depend on the current time.
            newEvaluator = newEvaluator.overrideTimeScope(this.timeScope);
        }

        let result: Record<string, PrimitiveValue> = {};
        for (let condition of this.conditions) {
            result[condition.id] = await condition.value.evaluate(newEvaluator);
        }

        return pMap(result);
    }

    async expand(graph: VariableGraph, formService: FormService): Promise<ExpandedVariableType | null> {
        let conditions: ExpandedGoalCondition[] = [];
        for (let condition of this.conditions) {
            let expanded = await condition.value.expand(graph, formService);
            if (expanded == null) return null;

            conditions.push({
                id: condition.id,
                type: condition.type,
                // @ts-ignore
                value: expanded
            });
        }
        return new ExpandedGoalVariableType(conditions, this.timeScope);
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
