import {ExpandedListVariableType, type ListVariableType} from "@perfice/services/variable/types/list";
import {type AggregateVariableType, ExpandedAggregateVariableType} from "@perfice/services/variable/types/aggregate";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {TimeScope} from "@perfice/model/variable/time/time";
import {ExpandedGoalVariableType, type GoalVariableType} from "@perfice/services/variable/types/goal";
import type {FormService} from "@perfice/services/form/form";
import type {VariableGraph} from "@perfice/services/variable/graph";

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


export interface EVT<T extends VariableTypeName, V extends ExpandedVariableType> {
    type: T;
    value: V;
}

export interface VariableType {
    evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue>;

    getDependencies(): string[];

    getType(): VariableTypeName;

    expand(graph: VariableGraph, formService: FormService): Promise<ExpandedVariableType | null>;
}

export interface ExpandedVariableType {
    shrink(): VariableType;
}

export interface VariableEvaluator {
    getEntriesInTimeRange(formId: string): Promise<JournalEntry[]>;

    evaluateVariable(variableId: string): Promise<PrimitiveValue>;

    overrideTimeScope(timeScope: TimeScope): VariableEvaluator;
}

export type ExpandedVariable = {
    id: string;
    name: string;
    type: ExpandedVariableTypeDef;
};


export async function expandVariable(v: Variable, graph: VariableGraph, formService: FormService): Promise<ExpandedVariable | null> {
    let expandedValue = await v.type.value.expand(graph, formService);
    if(expandedValue == null) return null;

    return {
        id: v.id,
        type: {
            type: v.type.type,
            // @ts-ignore Doesn't seem to be possible to narrow the type here
            value: expandedValue,
        }
    }
}

export function shrinkExpandedVariable(v: ExpandedVariable): Variable {
    let variableType = v.type.value.shrink();
    return {
        id: v.id,
        name: v.name,
        type: {
            type: v.type.type,
            // @ts-ignore Doesn't seem to be possible to narrow the type here
            value: variableType
        }
    }
}

export type ExpandedVariableTypeDef =
    EVT<VariableTypeName.LIST, ExpandedListVariableType>
    | EVT<VariableTypeName.AGGREGATE, ExpandedAggregateVariableType>
    | EVT<VariableTypeName.GOAL, ExpandedGoalVariableType>;

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
