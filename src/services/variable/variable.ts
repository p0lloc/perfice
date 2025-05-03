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
} from "@perfice/model/variable/variable";
import {deserializeVariableType, serializeVariableType} from "@perfice/services/variable/types/serialization";
import {EntryAction, type VariableGraph} from "@perfice/services/variable/graph";
import type {TimeScope} from "@perfice/model/variable/time/time";
import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import {serializeTimeScope} from "@perfice/model/variable/time/serialization";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";

export type VariableCallback = (v: PrimitiveValue) => void;

interface VariableListener {
    variableId: string;
    timeScope: TimeScope;
    callback: VariableCallback;

    updateListenerCallback: IndexUpdateListener;
    deleteListenerCallback: IndexDeleteListener | undefined;
}

export interface VariableProvider {
    getVariableById(id: string): Variable | undefined;
}

export class VariableService implements VariableProvider {

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

    /**
     * Gets all the variables that are currently in the graph.
     * Note that loadVariables must have been called before.
     */
    getVariables() {
        return this.graph.getVariables();
    }

    getVariableById(id: string): Variable | undefined {
        return this.graph.getVariableById(id);
    }

    /**
     * Evaluates a variable live, i.e. as soon as the value changes, the callback is called.
     * @param id Id of the variable to evaluate
     * @param timeScope Time scope to evaluate the variable in
     * @param callback Called when the variable value changes
     * @param deleteNotifications Whether to reevaluate the variable when it indices are deleted, and notify the callback again
     */
    async evaluateVariableLive(id: string, timeScope: TimeScope, callback: VariableCallback, deleteNotifications = true): Promise<PrimitiveValue> {
        let updateListener = async (i: VariableIndex) => {
            // Index must match both variable id and time context fully
            if (i.variableId != id ||
                i.timeScope != serializeTimeScope(timeScope)) return;

            // Notify the caller that the variable value has changed
            callback(i.value);
        };

        this.indexCollection.addUpdateListener(updateListener);

        let deleteListener: IndexDeleteListener | undefined = undefined;
        if (deleteNotifications) {
            deleteListener = async (i: VariableIndex) => {
                // Index must match both variable id and time context fully
                if (i.variableId != id ||
                    i.timeScope != serializeTimeScope(timeScope)) return;

                let evaluated = await this.evaluateVariable(id, timeScope);
                callback(evaluated);
            }

            this.indexCollection.addDeleteListener(deleteListener);
        }

        this.listeners.push({
            variableId: id,
            timeScope,
            callback,
            updateListenerCallback: updateListener,
            deleteListenerCallback: deleteListener
        });

        return await this.evaluateVariable(id, timeScope);
    }

    /**
     * Evaluates a variable and returns the value.
     */
    async evaluateVariable(id: string, timeScope: TimeScope): Promise<PrimitiveValue> {
        let variable = this.getVariableById(id)
        if (variable == null) {
            return pNull();
        }

        return this.graph.evaluateVariable(variable, timeScope, false, []);
    }

    /**
     * Unregisters a callback from the variable value updates.
     */
    unregisterListener(callback: VariableCallback) {
        let remaining: VariableListener[] = [];
        for (let listener of this.listeners) {
            if (listener.callback != callback) {
                remaining.push(listener);
                continue;
            }

            this.indexCollection.removeUpdateListener(listener.updateListenerCallback);

            if (listener.deleteListenerCallback != undefined) {
                this.indexCollection.removeDeleteListener(listener.deleteListenerCallback);
            }
        }

        this.listeners = remaining;
    }

    async createVariable(variable: Variable): Promise<void> {
        if (this.detectCircularDependencies(variable)) {
            throw new Error("Circular dependency detected");
        }

        let stored = this.serializeVariable(variable);
        await this.variableCollection.createVariable(stored);
        this.graph.onVariableCreated(variable);
        await this.observers.notifyObservers(EntityObserverType.CREATED, variable);
    }

    private detectCircularDependencies(variable: Variable): boolean {
        let visited = new Set<string>();
        let stack: Variable[] = [variable];

        while (stack.length > 0) {
            let current = stack.pop()!;
            if (visited.has(current.id)) return true;
            visited.add(current.id);

            let dependencies = current.type.value.getDependencies();
            for (let dependency of dependencies) {
                let dependencyVariable = this.getVariableById(dependency);
                if (dependencyVariable == null) continue;
                stack.push(dependencyVariable);
            }
        }

        return false;
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
        await this.graph.onJournalEntryAction(e, EntryAction.CREATED);
    }

    async onEntryDeleted(e: JournalEntry) {
        await this.graph.onJournalEntryAction(e, EntryAction.DELETED);
    }

    async onEntryUpdated(e: JournalEntry) {
        await this.graph.onJournalEntryAction(e, EntryAction.UPDATED);
    }

    async deleteVariableById(variableId: string) {
        let variable = this.getVariableById(variableId);
        if (variable == null) return;

        await this.variableCollection.deleteVariableById(variableId);
        await this.graph.onVariableDeleted(variableId);
        await this.observers.notifyObservers(EntityObserverType.DELETED, variable);
    }

    async deleteVariableAndDependencies(variableId: string, shouldDelete: (v: Variable) => boolean) {
        let variablesToDelete = await this.graph.deleteVariableAndDependencies(variableId, shouldDelete);
        for (let variable of variablesToDelete) {
            await this.variableCollection.deleteVariableById(variable.id);
            await this.observers.notifyObservers(EntityObserverType.DELETED, variable);
        }
    }

    async updateVariable(variable: Variable) {
        if (this.detectCircularDependencies(variable)) {
            throw new Error("Circular dependency detected");
        }

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

    async onTagEntryCreated(e: TagEntry) {
        await this.graph.onTagEntryAction(e, EntryAction.CREATED);
    }

    async onTagEntryDeleted(e: TagEntry) {
        await this.graph.onTagEntryAction(e, EntryAction.DELETED);
    }

    async onFormEntriesImported(formIds: Set<string>) {
        await this.graph.onFormEntriesImported(formIds);
    }
}
