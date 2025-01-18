import type {IndexCollection, IndexUpdateListener, VariableCollection} from "@perfice/db/collections";
import {
    type StoredVariable,
    type Variable, type VariableIndex,
    type VariableTypeDef,
} from "@perfice/model/variable/variable";
import {deserializeVariableType, serializeVariableType} from "@perfice/services/variable/types/serialization";
import type {VariableGraph} from "@perfice/services/variable/graph";
import type {TimeScope} from "@perfice/model/variable/time/time";
import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {JournalEntry} from "@perfice/model/journal/journal";
import {serializeTimeScope} from "@perfice/model/variable/time/serialization";


export type VariableCallback = (v: PrimitiveValue) => void;

interface VariableListener {
    variableId: string;
    timeScope: TimeScope;
    callback: VariableCallback;

    updateListenerCallback: IndexUpdateListener;
}

export class VariableService {

    private variableCollection: VariableCollection;
    private indexCollection: IndexCollection;
    private graph: VariableGraph;

    private listeners: VariableListener[] = [];

    constructor(variableCollection: VariableCollection, indexCollection: IndexCollection, variableGraph: VariableGraph) {
        this.variableCollection = variableCollection;
        this.indexCollection = indexCollection;
        this.graph = variableGraph;
    }

    async loadVariables(): Promise<void> {
        let stored = await this.variableCollection.getVariables();
        let variables = stored.map(this.deserializeVariable);

        this.graph.loadVariables(variables);
    }

    async evaluateVariableLive(id: string, timeScope: TimeScope, callback: VariableCallback): Promise<PrimitiveValue> {
        let updateListener = async (i: VariableIndex) => {
            // Index must match both variable id and time context fully
            if (i.variableId != id ||
                i.timeScope != serializeTimeScope(timeScope)) return;

            // Notify the caller that the variable value has changed
            callback(i.value);
        };

        this.indexCollection.addUpdateListener(updateListener);

        this.listeners.push({
            variableId: id,
            timeScope,
            callback,
            updateListenerCallback: updateListener
        });

        return await this.evaluateVariable(id, timeScope);
    }

    async evaluateVariable(id: string, timeScope: TimeScope): Promise<PrimitiveValue> {
        let variable = this.getVariableById(id)
        if (variable == null) {
            return pNull();
        }

        return this.graph.evaluateVariable(variable, timeScope, false, []);
    }


    unregisterListener(callback: VariableCallback) {
        let remaining: VariableListener[] = [];
        for (let listener of this.listeners) {
            if (listener.callback != callback) {
                remaining.push(listener);
                continue;
            }

            this.indexCollection.removeUpdateListener(listener.updateListenerCallback);
        }

        this.listeners = remaining;
    }

    async createVariable(variable: Variable): Promise<void> {
        let stored = this.serializeVariable(variable);
        await this.variableCollection.createVariable(stored);
        this.graph.onVariableCreated(variable);
    }

    getVariableById(id: string): Variable | undefined {
        return this.graph.getVariableById(id);
    }

    private serializeVariable(variable: Variable): StoredVariable {
        return {
            ...variable,
            type: {
                type: variable.type.type,
                value: serializeVariableType(variable.type.value)
            }
        }
    }

    private deserializeVariable(stored: StoredVariable): Variable {
        return {
            ...stored,
            type: {
                type: stored.type.type,
                value: deserializeVariableType(stored.type.type, stored.type.value)
            } as VariableTypeDef
        }
    }

    async onEntryCreated(e: JournalEntry) {
        await this.graph.onEntryCreated(e);
    }

    async onEntryDeleted(e: JournalEntry) {
        await this.graph.onEntryDeleted(e);
    }
    async onEntryUpdated(e: JournalEntry) {
        await this.graph.onEntryUpdated(e);
    }
}
