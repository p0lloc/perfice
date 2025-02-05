import {type ListVariableType} from "@perfice/services/variable/types/list";
import {type AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {TimeScope} from "@perfice/model/variable/time/time";
import {type GoalVariableType} from "@perfice/services/variable/types/goal";

export interface StoredVariable {
    id: string;
    name: string;
    type: {
        type: VariableTypeName;
        // Value is stored as an object, but deserialized into the actual class
        value: object;
    };
}

export type Variable = StoredVariable & {
    type: VariableTypeDef;
}

export interface TextOrDynamic {
    value: string;
    // If true, the value is a variable id that should be evaluated
    dynamic: boolean;
}

export enum VariableTypeName {
    LIST = "LIST",
    AGGREGATE = "AGGREGATE",
    GOAL = "GOAL"
}

export interface VT<T extends VariableTypeName, V extends VariableType> {
    type: T;
    value: V;
}

export interface VariableType {
    evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue>;

    getDependencies(): string[];

    getType(): VariableTypeName;
}

export interface VariableEvaluator {
    getEntriesInTimeRange(formId: string): Promise<JournalEntry[]>;

    evaluateVariable(variableId: string): Promise<PrimitiveValue>;

    overrideTimeScope(timeScope: TimeScope): VariableEvaluator;
}

export type VariableTypeDef =
    VT<VariableTypeName.LIST, ListVariableType>
    | VT<VariableTypeName.AGGREGATE, AggregateVariableType>
    | VT<VariableTypeName.GOAL, GoalVariableType>;



export interface VariableIndex {
    id: string;
    variableId: string;
    timeScope: string;
    value: PrimitiveValue;
}
