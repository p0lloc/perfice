import type {IndexCollection, JournalCollection} from "@perfice/db/collections";
import type {Variable, VariableEvaluator, VariableIndex} from "@perfice/model/variable/variable";
import type {JournalEntry} from "@perfice/model/journal/journal";
import {
    isTimestampInRange,
    type TimeRange,
    TimeRangeType,
    type TimeScope,
    WeekStart
} from "@perfice/model/variable/time/time";
import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {deserializeTimeScope, serializeTimeScope} from "@perfice/model/variable/time/serialization";


/**
 * Represents a variable type that is dependent on journal entries.
 */
export interface EntryCreatedDependent {
    onEntryCreated(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]>;
}

export interface EntryDeletedDependent {
    onEntryDeleted(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]>;
}

export interface EntryUpdatedDependent {
    onEntryUpdated(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]>;
}

export interface VariableIndexAction {
    type: VariableIndexActionType;
    index: VariableIndex;
}

export enum VariableIndexActionType {
    CREATE,
    UPDATE,
    DELETE,
}

function isEntryCreatedDependent(v: any): v is EntryCreatedDependent {
    return (v as EntryCreatedDependent).onEntryCreated !== undefined;
}

function isEntryDeletedDependent(v: any): v is EntryDeletedDependent {
    return (v as EntryDeletedDependent).onEntryDeleted !== undefined;
}

function isEntryUpdatedDependent(v: any): v is EntryUpdatedDependent {
    return (v as EntryUpdatedDependent).onEntryUpdated !== undefined;
}


/**
 * A DAG that can be used to evaluate variables, and updates dependent variables when a variable is updated.
 */
export class VariableGraph {
    private nodes: Map<string, Variable>;
    private dependents: Map<string, Set<string>>;

    private readonly indexCollection: IndexCollection;
    private readonly journalCollection: JournalCollection;

    private weekStart: WeekStart;

    private entryCreatedDependent: Map<string, EntryCreatedDependent> = new Map();
    private entryDeletedDependent: Map<string, EntryDeletedDependent> = new Map();
    private entryUpdatedDependent: Map<string, EntryUpdatedDependent> = new Map();

    constructor(indexCollection: IndexCollection, journalCollection: JournalCollection, weekStart: WeekStart) {
        this.nodes = new Map<string, Variable>();
        this.dependents = new Map<string, Set<string>>();
        this.indexCollection = indexCollection;
        this.journalCollection = journalCollection;
        this.weekStart = weekStart;
    }

    loadVariables(variables: Variable[]) {
        variables.forEach(v => {
            this.nodes.set(v.id, v);
            this.setupJournalDependencies(v);
        });
        this.updateDependents();
    }

    getVariableById(id: string): Variable | undefined {
        return this.nodes.get(id);
    }

    updateDependents() {
        this.dependents.clear();
        for (let node of this.nodes.values()) {
            this.updateDependentsForVariable(node);
        }
    }

    async evaluateVariable(variable: Variable, timeScope: TimeScope, skipCache: boolean, evaluating: string[]): Promise<PrimitiveValue> {
        if (!skipCache) {
            let cached = await this.indexCollection.getIndexByVariableAndTimeScope(variable.id,
                serializeTimeScope(timeScope));

            if (cached != null)
                return cached.value;
        }

        // TODO: when evaluating variables we could probably fetch all indices for the time scope upfront
        //  and pass them on in the chain. perhaps "getDependencies" could also return transitive dependencies
        //  so we can include only variable ids that are relevant.
        //  maybe this is a place to introduce some benchmarks for.

        evaluating.push(variable.id);
        let value = await this.runEvaluation(variable, timeScope, evaluating);
        evaluating.pop();

        let cached = await this.indexCollection.getIndexByVariableAndTimeScope(variable.id,
            serializeTimeScope(timeScope));

        // Update existing index or create new one with the evaluated value
        if (cached != null) {
            await this.indexCollection.updateIndex({...cached, value});
        } else {
            await this.indexCollection.createIndex({
                id: crypto.randomUUID(),
                variableId: variable.id,
                timeScope: serializeTimeScope(timeScope),
                value,
            })
        }

        await this.reevaluateDependentVariables(variable, timeScope, evaluating);
        return value;
    }

    private setupJournalDependencies(variable: Variable) {
        if (isEntryCreatedDependent(variable.type.value)) {
            this.entryCreatedDependent.set(variable.id, variable.type.value);
        }

        if (isEntryDeletedDependent(variable.type.value)) {
            this.entryDeletedDependent.set(variable.id, variable.type.value);
        }

        if (isEntryUpdatedDependent(variable.type.value)) {
            this.entryUpdatedDependent.set(variable.id, variable.type.value);
        }
    }

    onVariableCreated(v: Variable) {
        this.updateDependentsForVariable(v);
        this.setupJournalDependencies(v);

        this.nodes.set(v.id, v);
    }

    private filterIndicesByTimestamp(indices: VariableIndex[], timestamp: number) {
        let result: VariableIndex[] = [];
        for (let index of indices) {
            let scope = deserializeTimeScope(index.timeScope, this.weekStart);
            if (!isTimestampInRange(timestamp, scope.value.convertToRange()))
                continue;

            result.push(index);
        }

        return result;
    }

    private async processIndexActions(variable: Variable, actions: VariableIndexAction[]) {
        let actionMap: Map<VariableIndexActionType, VariableIndex[]> = new Map();
        let scopesToReevaluate: TimeScope[] = [];
        for (const action of actions) {
            let existing = actionMap.get(action.type);
            if (existing != null) {
                existing.push(action.index);
            } else {
                actionMap.set(action.type, [action.index]);
            }

            let scope = deserializeTimeScope(action.index.timeScope, this.weekStart);
            scopesToReevaluate.push(scope);
        }

        for (let [type, indices] of actionMap.entries()) {
            switch (type) {
                case VariableIndexActionType.CREATE: {
                    await this.indexCollection.updateIndices(indices);
                    break;
                }
                case VariableIndexActionType.UPDATE: {
                    await this.indexCollection.updateIndices(indices);
                    break;
                }
                case VariableIndexActionType.DELETE: {
                    await this.indexCollection.deleteIndicesByIds(indices.map(i => i.id));
                    break;
                }
            }
        }

        for (let scope of scopesToReevaluate) {
            await this.evaluateVariable(variable, scope, true, []);
        }
    }

    private async handleEntryAction(entry: JournalEntry, variableId: string, action: (indices: VariableIndex[]) => Promise<VariableIndexAction[]>) {
        let indices = await this.indexCollection.getIndicesByVariableId(variableId);
        let filteredIndices = this.filterIndicesByTimestamp(indices, entry.timestamp);

        let variable = this.getVariableById(variableId);
        if (variable == undefined) return;

        let actions = await action(filteredIndices);
        await this.processIndexActions(variable, actions);
    }

    async onEntryCreated(entry: JournalEntry) {
        if(this.entryCreatedDependent.size == 0) return;

        for (let [variableId, dependent] of this.entryCreatedDependent.entries()) {
            await this.handleEntryAction(entry, variableId,
                (indices: VariableIndex[]) => dependent.onEntryCreated(entry, indices));
        }
    }

    async onEntryDeleted(entry: JournalEntry) {
        if(this.entryDeletedDependent.size == 0) return;

        for (let [variableId, dependent] of this.entryDeletedDependent.entries()) {
            await this.handleEntryAction(entry, variableId,
                (indices: VariableIndex[]) => dependent.onEntryDeleted(entry, indices));
        }
    }

    async onEntryUpdated(entry: JournalEntry) {
        if(this.entryUpdatedDependent.size == 0) return;

        for (let [variableId, dependent] of this.entryUpdatedDependent.entries()) {
            await this.handleEntryAction(entry, variableId,
                (indices: VariableIndex[]) => dependent.onEntryUpdated(entry, indices));
        }
    }

    async onVariableDeleted(id: string) {
        // When a variable is deleted, we need to delete all of its indices
        await this.indexCollection.deleteIndicesByVariableId(id);
        await this.deleteIndicesForDependentVariables(id);
    }

    async onVariableUpdated(variable: Variable) {
        // When a variable is updated, we need to delete all of its indices
        await this.indexCollection.deleteIndicesByVariableId(variable.id);
        await this.deleteIndicesForDependentVariables(variable.id);
    }

    private async deleteIndicesForDependentVariables(variableId: string) {
        let dependents = this.dependents.get(variableId);
        if (dependents == undefined) return;

        for (let dependentId of dependents) {
            await this.indexCollection.deleteIndicesByVariableId(dependentId);
        }
    }

    /**
     * Reevaluates any dependent variables that are affected by the given variable.
     */
    private async reevaluateDependentVariables(variable: Variable, timeScope: TimeScope, evaluating: string[]) {
        let dependents = this.dependents.get(variable.id);
        if (dependents == undefined) return;

        for (let dependent of dependents) {
            // Don't send notification to variable that we are currently evaluating
            if (evaluating.includes(dependent))
                continue;

            let variable = this.getVariableById(dependent);
            if (variable != null) {
                await this.evaluateVariable(variable, timeScope, true, evaluating);
            }
        }
    }

    private async runEvaluation(variable: Variable, timeScope: TimeScope, evaluating: string[]): Promise<PrimitiveValue> {
        return variable.type.value.evaluate(new BaseVariableEvaluator(timeScope, evaluating, this, this.journalCollection));
    }

    private updateDependentsForVariable(node: Variable) {
        let dependencies = node.type.value.getDependencies();
        for (let dependency of dependencies) {
            let existing = this.dependents.get(dependency);
            if (existing != null) {
                existing.add(node.id);
            } else {
                this.dependents.set(dependency, new Set([node.id]));
            }
        }
    }

    getVariables(): Variable[] {
        return Array.from(this.nodes.values());
    }

    setWeekStart(weekStart: WeekStart) {
        this.weekStart = weekStart;
    }

}


export class BaseVariableEvaluator implements VariableEvaluator {

    private readonly timeContext: TimeScope;
    private readonly evaluating: string[];
    private graph: VariableGraph;
    private journalCollection: JournalCollection;

    constructor(timeContext: TimeScope, evaluating: string[], variableService: VariableGraph, journalCollection: JournalCollection) {
        this.timeContext = timeContext;
        this.evaluating = evaluating;
        this.graph = variableService;
        this.journalCollection = journalCollection;
    }

    overrideTimeScope(newTimeScope: TimeScope): VariableEvaluator {
        return new BaseVariableEvaluator(newTimeScope, this.evaluating, this.graph, this.journalCollection);
    }

    async getEntriesInTimeRange(formId: string): Promise<JournalEntry[]> {
        let action: TimeRange = this.timeContext.value.convertToRange();
        switch (action.type) {
            case TimeRangeType.ALL: {
                return this.journalCollection.getAllEntriesByFormId(formId);
            }
            case TimeRangeType.BOTH: {
                return this.journalCollection.getEntriesByFormIdAndTimeRange(formId, action.lower, action.upper);
            }
            default:
                throw new Error("Not yet implemented");
        }
    }

    async evaluateVariable(variableId: string): Promise<PrimitiveValue> {
        const variable = this.graph.getVariableById(variableId);
        if (variable == null) {
            return pNull();
        }

        return this.graph.evaluateVariable(variable, this.timeContext, false, this.evaluating);
    }
}
