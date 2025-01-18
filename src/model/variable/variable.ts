import type {ListVariableType} from "@perfice/services/variable/types/list";
import type {AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {JournalEntry} from "@perfice/model/journal/journal";

export interface StoredVariable {
    id: string;
    type: {
        type: VariableTypeName;
        // Value is stored as an object, but deserialized into the actual class
        value: object;
    };
}

export enum VariableTypeName {
    LIST = "LIST",
    AGGREGATE = "AGGREGATE"
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
}

export type VariableTypeDef = VT<VariableTypeName.LIST, ListVariableType> | VT<VariableTypeName.AGGREGATE, AggregateVariableType>;

export type Variable = StoredVariable & {
    type: VariableTypeDef;
}


export interface VariableIndex {
    id: string;
    variableId: string;
    timeScope: string;
    value: PrimitiveValue;
}
