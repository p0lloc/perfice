import type { JournalEntry } from "@perfice/model/journal/journal";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {StoredVariable, Variable, VariableIndex} from "@perfice/model/variable/variable";

export interface TrackableCollection {
    getTrackables(): Promise<Trackable[]>;
    createTrackable(trackable: Trackable): Promise<void>;
    updateTrackable(trackable: Trackable): Promise<void>;
    deleteTrackableById(trackableId: string): Promise<void>;
}
export interface VariableCollection {
    getVariables(): Promise<StoredVariable[]>;
    getVariableById(id: string): Promise<StoredVariable | undefined>;
    createVariable(stored: StoredVariable): Promise<void>;
}

export interface JournalCollection {
    getAllEntriesByFormId(formId: string): Promise<JournalEntry[]>;

    getEntriesByFormIdAndTimeRange(formId: string, start: number, end: number): Promise<JournalEntry[]>;

    createEntry(entry: JournalEntry): Promise<void>;

    updateEntry(entry: JournalEntry): Promise<void>;

    deleteEntriesByFormId(formId: string): Promise<void>;
}


export interface IndexCollection {
    getIndexByVariableAndScopeAndTimeStamp(variableId: string, timeScope: string, timestamp: number): Promise<VariableIndex | undefined>;

    createIndex(index: VariableIndex): Promise<void>;

    updateIndex(index: VariableIndex): Promise<void>;

    getIndicesByVariableId(variableId: string): Promise<VariableIndex[]>;

    deleteIndicesByVariableId(id: string): Promise<void>;
}
