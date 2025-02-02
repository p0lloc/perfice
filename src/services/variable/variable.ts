import type {
    IndexCollection,
    IndexDeleteListener,
    IndexUpdateListener,
    VariableCollection
} from "@perfice/db/collections";
import {
    type StoredVariable,
    type Variable,
    type VariableIndex,
    type VariableTypeDef,
    VariableTypeName,
} from "@perfice/model/variable/variable";
import {deserializeVariableType, serializeVariableType} from "@perfice/services/variable/types/serialization";
import type {VariableGraph} from "@perfice/services/variable/graph";
import type {TimeScope} from "@perfice/model/variable/time/time";
import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {JournalEntry} from "@perfice/model/journal/journal";
import {serializeTimeScope} from "@perfice/model/variable/time/serialization";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {Form, FormQuestion} from "@perfice/model/form/form";


export type VariableCallback = (v: PrimitiveValue) => void;

interface VariableListener {
    variableId: string;
    timeScope: TimeScope;
    callback: VariableCallback;

    updateListenerCallback: IndexUpdateListener;
    deleteListenerCallback: IndexDeleteListener;
}

export class VariableService {

    private variableCollection: VariableCollection;
    private indexCollection: IndexCollection;
    private graph: VariableGraph;

    private listeners: VariableListener[] = [];
    private observers: EntityObservers<Variable>;

    constructor(variableCollection: VariableCollection, indexCollection: IndexCollection, variableGraph: VariableGraph) {
        this.variableCollection = variableCollection;
        this.indexCollection = indexCollection;
        this.graph = variableGraph;

        this.observers = new EntityObservers();
    }

    async loadVariables(): Promise<Variable[]> {
        let stored = await this.variableCollection.getVariables();
        let variables = stored.map(this.deserializeVariable);

        this.graph.loadVariables(variables);
        return variables;
    }

    async evaluateVariableLive(id: string, timeScope: TimeScope, callback: VariableCallback): Promise<PrimitiveValue> {
        let updateListener = async (i: VariableIndex) => {
            // Index must match both variable id and time context fully
            if (i.variableId != id ||
                i.timeScope != serializeTimeScope(timeScope)) return;

            // Notify the caller that the variable value has changed
            callback(i.value);
        };

        let deleteListener = async (i: VariableIndex) => {
            // Index must match both variable id and time context fully
            if (i.variableId != id ||
                i.timeScope != serializeTimeScope(timeScope)) return;

            let evaluated = await this.evaluateVariable(id, timeScope);
            callback(evaluated);
        }

        this.indexCollection.addUpdateListener(updateListener);
        this.indexCollection.addDeleteListener(deleteListener);

        this.listeners.push({
            variableId: id,
            timeScope,
            callback,
            updateListenerCallback: updateListener,
            deleteListenerCallback: deleteListener
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
            this.indexCollection.removeDeleteListener(listener.deleteListenerCallback);
        }

        this.listeners = remaining;
    }

    async createVariable(variable: Variable): Promise<void> {
        let stored = this.serializeVariable(variable);
        await this.variableCollection.createVariable(stored);
        this.graph.onVariableCreated(variable);
        await this.observers.notifyObservers(EntityObserverType.CREATED, variable);
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

    async deleteVariableById(variableId: string) {
        let variable = this.getVariableById(variableId);
        if (variable == null) return;

        await this.variableCollection.deleteVariableById(variableId);
        await this.graph.onVariableDeleted(variableId);
        await this.observers.notifyObservers(EntityObserverType.DELETED, variable);
    }

    async updateVariable(variable: Variable) {
        await this.variableCollection.updateVariable(this.serializeVariable(variable));
        await this.graph.onVariableUpdated(variable);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, variable);
    }

    public addObserver(type: EntityObserverType, callback: EntityObserverCallback<Variable>) {
        this.observers.addObserver(type, callback);
    }

    public removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Variable>) {
        this.observers.removeObserver(type, callback);
    }

    /*
    TODO: Most likely not needed because variables fetch values from entries, that are not modified as the form changes.

    private getVariablesReferencingQuestions(questions: FormQuestion[]): Variable[] {
        let variables: Variable[] = [];
        for (let variable of this.graph.getVariables()) {
            if(variable.type.type != VariableTypeName.LIST) continue;

            for (let field of Object.keys(variable.type.value.getFields())) {
                if(!questions.some(q => q.id == field)) continue;

                variables.push(variable);
            }
        }

        return variables
    }

    async onFormUpdated(f: Form) {
        let variables = this.getVariablesReferencingQuestions(f.questions);
        for(let variable of variables) {
            await this.indexCollection.deleteIndicesByVariableId(variable.id);
        }
    }*/


}
