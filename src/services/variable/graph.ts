import type {IndexCollection, JournalCollection} from "@perfice/db/collections";
import type {Variable} from "@perfice/model/variable/variable";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {TimeScope} from "@perfice/model/variable/time/time";


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
 * A DAG that can be usd to evaluate variables, and updates dependent variables when a variable is updated.
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



}
