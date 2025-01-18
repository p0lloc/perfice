import type {IndexCollection, JournalCollection} from "@perfice/db/collections";
import type {Variable, VariableEvaluator} from "@perfice/model/variable/variable";
import type {JournalEntry} from "@perfice/model/journal/journal";
import {type TimeRange, TimeRangeType, type TimeScope} from "@perfice/model/variable/time/time";
import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {serializeTimeScope} from "@perfice/model/variable/time/serialization";


/**
 * Represents a variable type that is dependent on journal entries.
 */
export interface JournalDependent {
    onEntryCreated(entry: JournalEntry, variableId: string,
                   indexCollection: IndexCollection, reevaluate: (context: TimeScope) => Promise<void>): Promise<void>;
}

function isJournalDependentType(v: any): v is JournalDependent {
    return (v as JournalDependent).onEntryCreated !== undefined;
}

/**
 * A DAG that can be used to evaluate variables, and updates dependent variables when a variable is updated.
 */
export class VariableGraph {
    private nodes: Map<string, Variable>;
    private dependents: Map<string, Set<string>>;

    private readonly indexCollection: IndexCollection;
    private readonly journalCollection: JournalCollection;

    private journalDependent: Map<string, JournalDependent> = new Map();

    constructor(indexCollection: IndexCollection, journalCollection: JournalCollection) {
        this.nodes = new Map<string, Variable>();
        this.dependents = new Map<string, Set<string>>();
        this.indexCollection = indexCollection;
        this.journalCollection = journalCollection;
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

    onVariableCreated(v: Variable) {
        this.updateDependentsForVariable(v);
        if (isJournalDependentType(v.type.value)) {
            this.journalDependent.set(v.id, v.type.value);
        }

        this.nodes.set(v.id, v);
    }

    async onVariableDeleted(id: string) {
        // When a variable is deleted, we need to delete all of its indices
        await this.indexCollection.deleteIndicesByVariableId(id);
    }

    async onVariableUpdated(variable: Variable) {
        // When a variable is updated, we need to delete all of its indices
        await this.indexCollection.deleteIndicesByVariableId(variable.id);
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
