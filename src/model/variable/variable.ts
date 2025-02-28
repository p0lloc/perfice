import {type ListVariableType} from "@perfice/services/variable/types/list";
import {type AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import type {TimeScope} from "@perfice/model/variable/time/time";
import {type GoalVariableType} from "@perfice/services/variable/types/goal";
import type {CalculationVariableType} from "@perfice/services/variable/types/calculation";
import type { TagVariableType } from "@perfice/services/variable/types/tag";
import type {LatestVariableType} from "@perfice/services/variable/types/latest";

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
    GOAL = "GOAL",
    CALCULATION = "CALCULATION",
    TAG = "TAG",
    LATEST = "LATEST"
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
    getJournalEntriesInTimeRange(formId: string): Promise<JournalEntry[]>;

    getTagEntriesInTimeRange(formId: string): Promise<TagEntry[]>;

    evaluateVariable(variableId: string): Promise<PrimitiveValue>;

    overrideTimeScope(timeScope: TimeScope): VariableEvaluator;

    getTimeScope(): TimeScope;
}

export type VariableTypeDef =
    VT<VariableTypeName.LIST, ListVariableType>
    | VT<VariableTypeName.AGGREGATE, AggregateVariableType>
    | VT<VariableTypeName.GOAL, GoalVariableType>
    | VT<VariableTypeName.CALCULATION, CalculationVariableType>
    | VT<VariableTypeName.TAG, TagVariableType>
    | VT<VariableTypeName.LATEST, LatestVariableType>
    ;


export interface VariableIndex {
    id: string;
    variableId: string;
    timeScope: string;
    value: PrimitiveValue;
}
