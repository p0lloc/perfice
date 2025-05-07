import {primitiveAsNumber} from "../primitive/primitive";
import {VariableTypeName} from "@perfice/model/variable/variable";
import {
    ComparisonOperator,
    type ConstantOrVariable,
    type GoalCondition,
    GoalConditionType
} from "@perfice/services/variable/types/goal";
import {
    faBullseye,
    faDivide,
    faEquals,
    faGreaterThan,
    faGreaterThanEqual,
    faLessThan,
    faLessThanEqual,
    faNotEqual,
    faPlusMinus
} from "@fortawesome/free-solid-svg-icons";
import type {ComparisonValueResult} from "@perfice/stores/goal/value";
import {calculateProgressSafe} from "@perfice/util/math";
import type {FormQuestionDataType} from "@perfice/model/form/form";

export const NEW_GOAL_ROUTE = "new";

export interface ConditionProgress {
    first: number;
    second: number;
    progress: number;
    dataType: FormQuestionDataType;
    unit: string | null;
}

export function getGoalConditionProgress(value: ComparisonValueResult): ConditionProgress {
    let first = primitiveAsNumber(value.source);
    let second = primitiveAsNumber(value.target);

    return {first, second, progress: calculateProgressSafe(first, second), dataType: value.dataType, unit: value.unit};
}

export enum GoalSidebarActionType {
    ADD_SOURCE,
    ADD_CONDITION
}

export type GoalSidebarAction =
    SA<GoalSidebarActionType.ADD_SOURCE, GoalAddSourceAction>
    | SA<GoalSidebarActionType.ADD_CONDITION, GoalAddConditionAction>;

export interface GoalAddSourceAction {
    onSourceSelected: (c: VariableTypeName) => void;
}

export interface GoalAddConditionAction {
    onConditionSelected: (c: GoalCondition) => void;
}

export interface SA<T extends GoalSidebarActionType, V> {
    type: T;
    value: V;
}


export const COMPARISON_OPERATORS = [
    {name: "Equal", value: ComparisonOperator.EQUAL, icon: faEquals},
    {name: "Not equal", value: ComparisonOperator.NOT_EQUAL, icon: faNotEqual},
    {name: "Greater than", value: ComparisonOperator.GREATER_THAN, icon: faGreaterThan},
    {name: "Greater than or equal", value: ComparisonOperator.GREATER_THAN_EQUAL, icon: faGreaterThanEqual},
    {name: "Less than", value: ComparisonOperator.LESS_THAN, icon: faLessThan},
    {name: "Less than or equal", value: ComparisonOperator.LESS_THAN_EQUAL, icon: faLessThanEqual},
];

export const GOAL_CONDITION_TYPES = [
    {
        type: GoalConditionType.COMPARISON,
        name: "Comparison",
        description: "Compare two variables",
        icon: faGreaterThanEqual,
    },

    {
        type: GoalConditionType.GOAL_MET,
        name: "Goal met",
        description: "Check if another goal is met",
        icon: faBullseye,
    }
];

export const COMPARISON_SOURCE_TYPES = [
    {
        type: VariableTypeName.AGGREGATE,
        name: "Aggregation",
        description: "Operations like sum, average, etc",
        icon: faDivide,
    },
    {
        type: VariableTypeName.CALCULATION,
        name: "Calculation",
        description: "Calculation between variables",
        icon: faPlusMinus,
    },
];

export interface EditConstantOrVariableState {
    value: ConstantOrVariable;
    onChange: (v: ConstantOrVariable) => void;
}
