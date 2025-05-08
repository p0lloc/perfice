import type {IndexCollection, JournalCollection, TagEntryCollection} from "@perfice/db/collections";
import {
    FIXED_TIME_SCOPE_VARIABLES,
    type Variable,
    type VariableEvaluator,
    type VariableIndex
} from "@perfice/model/variable/variable";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import {
    isTimestampInRange,
    type TimeRange,
    TimeRangeType,
    type TimeScope,
    WeekStart
} from "@perfice/model/variable/time/time";
import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {deserializeTimeScope, serializeTimeScope} from "@perfice/model/variable/time/serialization";

export interface FormIdDependent {
    /**
     * Returns ids of forms that this variable depends on.
     */
    getFormDependencies(): string[];
}

export interface TagIdDependent {
    /**
     * Returns ids of tags that this variable depends on.
     */
    getTagDependencies(): string[];
}

export enum EntryAction {
    CREATED,
    DELETED,
    UPDATED,
}

/**
 * Represents a variable type that is dependent on changes in journal entries.
 */
export interface JournalEntryDependent extends FormIdDependent {
    onJournalEntryAction(entry: JournalEntry, action: EntryAction, indices: VariableIndex[]): Promise<VariableIndexAction[]>;
}

/**
 * Represents a variable type that is dependent on changes in tag entries.
 */
export interface TagEntryDependent extends TagIdDependent {
    onTagEntryAction(entry: TagEntry, action: EntryAction, indices: VariableIndex[]): Promise<VariableIndexAction[]>;
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

function isJournalEntryDependent(v: any): v is JournalEntryDependent {
    return (v as JournalEntryDependent).onJournalEntryAction !== undefined;
}

function isTagEntryDependent(v: any): v is TagEntryDependent {
    return (v as TagEntryDependent).onTagEntryAction !== undefined;
}


/**
 * A DAG that can be used to evaluate variables, and updates dependent variables when a variable is updated.
 */
export class VariableGraph {
    private nodes: Map<string, Variable>;
    private dependents: Map<string, Set<string>>;

    private readonly indexCollection: IndexCollection;
    private readonly journalCollection: JournalCollection;
    private readonly tagEntryCollection: TagEntryCollection;

    private weekStart: WeekStart;

    private journalEntryDependent: Map<string, JournalEntryDependent> = new Map();
    private tagEntryDependent: Map<string, TagEntryDependent> = new Map();

    constructor(indexCollection: IndexCollection, journalCollection: JournalCollection, tagEntryCollection: TagEntryCollection, weekStart: WeekStart) {
        this.nodes = new Map<string, Variable>();
        this.dependents = new Map<string, Set<string>>();
        this.indexCollection = indexCollection;
        this.journalCollection = journalCollection;
        this.tagEntryCollection = tagEntryCollection;
        this.weekStart = weekStart;
    }

    loadVariables(variables: Variable[]) {
        variables.forEach(v => {
            this.nodes.set(v.id, v);
            this.setupEntryDependencies(v);
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
        // If variable has a fixed time scope, use that instead of the passed in time scope
        let fixedTimeScope = FIXED_TIME_SCOPE_VARIABLES.get(variable.type.type);
        if (fixedTimeScope != null)
            timeScope = fixedTimeScope;

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

    private deleteJournalDependencies(variableId: string) {
        this.journalEntryDependent.delete(variableId);
        this.tagEntryDependent.delete(variableId);
    }

    private setupEntryDependencies(variable: Variable) {
        if (isJournalEntryDependent(variable.type.value)) {
            this.journalEntryDependent.set(variable.id, variable.type.value);
        }

        if (isTagEntryDependent(variable.type.value)) {
            this.tagEntryDependent.set(variable.id, variable.type.value);
        }
    }

    onVariableCreated(v: Variable) {
        this.nodes.set(v.id, v);
        this.updateDependentsForVariable(v);
        this.setupEntryDependencies(v);
    }

    async onVariableDeleted(id: string) {
        this.nodes.delete(id);

        // Delete any entry dependents
        this.deleteJournalDependencies(id);

        // When a variable is deleted, we need to delete all of its indices
        await this.deleteIndicesForVariableAndDependents(id);
    }

    async onVariableUpdated(variable: Variable) {
        // When a variable is updated, we need to delete all of its indices
        this.nodes.set(variable.id, variable);

        // Variable might have a completely different form, so we need to update any journal dependencies.
        this.deleteJournalDependencies(variable.id);
        this.setupEntryDependencies(variable);
        // Do the same for internal graph dependencies
        this.removeDependenciesForVariable(variable.id);
        this.updateDependentsForVariable(variable);

        await this.deleteIndicesForVariableAndDependents(variable.id);
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

    private async handleEntryAction(timestamp: number, variableId: string, action: (indices: VariableIndex[]) => Promise<VariableIndexAction[]>) {
        let indices = await this.indexCollection.getIndicesByVariableId(variableId);
        let filteredIndices = this.filterIndicesByTimestamp(indices, timestamp);

        let variable = this.getVariableById(variableId);
        if (variable == undefined) return;

        let actions = await action(filteredIndices);
        await this.processIndexActions(variable, actions);
    }

    async onJournalEntryAction(entry: JournalEntry, action: EntryAction) {
        if (this.journalEntryDependent.size == 0) return;

        for (let [variableId, dependent] of this.filterEntryDependents(this.journalEntryDependent,
            v => v.getFormDependencies().includes(entry.formId)).entries()) {

            await this.handleEntryAction(entry.timestamp, variableId,
                (indices: VariableIndex[]) => dependent.onJournalEntryAction(entry, action, indices));
        }
    }


    async onTagEntryAction(entry: TagEntry, action: EntryAction) {
        if (this.tagEntryDependent.size == 0) return;

        for (let [variableId, dependent] of this.filterEntryDependents(this.tagEntryDependent,
            v => v.getTagDependencies().includes(entry.tagId)).entries()) {

            await this.handleEntryAction(entry.timestamp, variableId,
                (indices: VariableIndex[]) => dependent.onTagEntryAction(entry, action, indices));
        }
    }

    private filterEntryDependents<V>(map: Map<string, V>, shouldInclude: (v: V) => boolean): Map<string, V> {
        let result: Map<string, V> = new Map();
        for (let [id, dependent] of map.entries()) {
            if (shouldInclude(dependent)) {
                result.set(id, dependent);
            }
        }

        return result;
    }

    async deleteVariableAndDependencies(id: string, shouldDeleteChild: (v: Variable) => boolean): Promise<Variable[]> {
        let variable = this.getVariableById(id);
        if (variable == null) return [];

        let stack = [variable];
        let variablesToDelete: Variable[] = [variable];
        while (stack.length > 0) {
            let current = stack.pop();
            if (current == null) continue;

            variablesToDelete.push(current);

            let dependencies = current.type.value.getDependencies();
            for (let dependency of dependencies) {
                let child = this.getVariableById(dependency);
                if (child == null) continue;

                if (!shouldDeleteChild(child)) continue;

                stack.push(child);
            }
        }

        // This could be more optimized by deleting all variables at once
        // But then we would need to keep the logic in sync with onVariableDeleted
        for (const v of variablesToDelete) {
            await this.onVariableDeleted(v.id);
        }

        return variablesToDelete;
    }

    private async deleteIndicesForVariableAndDependents(variableId: string) {
        await this.indexCollection.deleteIndicesByVariableId(variableId);

        let dependents = this.dependents.get(variableId);
        if (dependents == undefined) return;

        for (let dependentId of dependents) {
            await this.deleteIndicesForVariableAndDependents(dependentId);
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
        return variable.type.value.evaluate(new BaseVariableEvaluator(timeScope, evaluating, this, this.journalCollection, this.tagEntryCollection));
    }

    // TODO: should we have a bidirectional relation?
    private getStoredDependenciesForVariable(variableId: string): string[] {
        let result: string[] = [];
        for (let [dependent, dependencies] of this.dependents.entries()) {
            if (dependencies.has(variableId)) {
                result.push(dependent);
            }
        }

        return result;
    }

    /**
     * Removes all dependencies for the given variable.
     */
    private removeDependenciesForVariable(variableId: string) {
        for (let dependencies of this.dependents.values()) {
            dependencies.delete(variableId);
        }
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

    async setWeekStart(weekStart: WeekStart) {
        this.weekStart = weekStart;

        // Changing week start will break old indices that haven't been updated for the new week start
        // It's easiest to just delete all indices and recreate them as needed
        await this.indexCollection.deleteAllIndices();
    }

    async onFormEntriesImported(formIds: Set<string>) {
        for (let formId of formIds) {
            let variableIds = this.filterEntryDependents(this.journalEntryDependent,
                v => v.getFormDependencies().includes(formId)).keys().toArray();

            for (let variableId of variableIds) {
                await this.deleteIndicesForVariableAndDependents(variableId);
            }
        }
    }
}


export class BaseVariableEvaluator implements VariableEvaluator {

    private readonly timeContext: TimeScope;
    private readonly evaluating: string[];
    private readonly graph: VariableGraph;
    private readonly journalCollection: JournalCollection;
    private readonly tagEntryCollection: TagEntryCollection;

    constructor(timeContext: TimeScope, evaluating: string[], variableService: VariableGraph,
                journalCollection: JournalCollection, tagEntryCollection: TagEntryCollection) {
        this.timeContext = timeContext;
        this.evaluating = evaluating;
        this.graph = variableService;
        this.journalCollection = journalCollection;
        this.tagEntryCollection = tagEntryCollection;
    }

    overrideTimeScope(newTimeScope: TimeScope): VariableEvaluator {
        return new BaseVariableEvaluator(newTimeScope, this.evaluating, this.graph, this.journalCollection, this.tagEntryCollection);
    }

    async getTagEntriesInTimeRange(tagId: string): Promise<TagEntry[]> {
        // TODO: interface to reuse time range logic?
        let action: TimeRange = this.timeContext.value.convertToRange();
        switch (action.type) {
            case TimeRangeType.ALL: {
                return this.tagEntryCollection.getAllEntriesByTagId(tagId);
            }
            case TimeRangeType.BETWEEN: {
                return this.tagEntryCollection.getEntriesByTagIdAndTimeRange(tagId, action.lower, action.upper);
            }
            case TimeRangeType.BEFORE: {
                return this.tagEntryCollection.getEntriesByTagIdUntilTime(tagId, action.upper);
            }
            case TimeRangeType.AFTER: {
                return this.tagEntryCollection.getEntriesByTagIdFromTime(tagId, action.lower);
            }
            default:
                throw new Error("Not yet implemented");
        }
    }

    async getJournalEntriesInTimeRange(formId: string): Promise<JournalEntry[]> {
        let action: TimeRange = this.timeContext.value.convertToRange();
        switch (action.type) {
            case TimeRangeType.ALL: {
                return this.journalCollection.getAllEntriesByFormId(formId);
            }
            case TimeRangeType.BETWEEN: {
                return this.journalCollection.getEntriesByFormIdAndTimeRange(formId, action.lower, action.upper);
            }
            case TimeRangeType.BEFORE: {
                return this.journalCollection.getEntriesByFormIdUntilTime(formId, action.upper);
            }
            case TimeRangeType.AFTER: {
                return this.journalCollection.getEntriesByFormIdFromTime(formId, action.lower);
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

    getTimeScope(): TimeScope {
        return this.timeContext;
    }

    getVariableById(id: string): Variable | undefined {
        return this.graph.getVariableById(id);
    }

}
