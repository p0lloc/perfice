import type { JournalEntry } from "@perfice/model/journal/journal";
import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {StoredVariable, VariableIndex} from "@perfice/model/variable/variable";
import type {Form} from "@perfice/model/form/form";

export interface TrackableCollection {
    getTrackables(): Promise<Trackable[]>;
    createTrackable(trackable: Trackable): Promise<void>;
    updateTrackable(trackable: Trackable): Promise<void>;
    deleteTrackableById(trackableId: string): Promise<void>;
}

export interface TrackableCategoryCollection {
    getCategories(): Promise<TrackableCategory[]>;
    createCategory(category: TrackableCategory): Promise<void>;
    updateCategory(category: TrackableCategory): Promise<void>;
    deleteCategoryById(categoryId: string): Promise<void>;
}

export interface VariableCollection {
    getVariables(): Promise<StoredVariable[]>;
    getVariableById(id: string): Promise<StoredVariable | undefined>;
    createVariable(stored: StoredVariable): Promise<void>;

    deleteVariableById(variableId: string): Promise<void>;
    updateVariable(variable: StoredVariable): Promise<void>;
}

export interface FormCollection {
    getForms(): Promise<Form[]>;
    getFormById(id: string): Promise<Form | undefined>;
    createForm(form: Form): Promise<void>;
    updateForm(form: Form): Promise<void>;
    deleteFormById(id: string): Promise<void>;
}

export interface JournalCollection {
    getAllEntriesByFormId(formId: string): Promise<JournalEntry[]>;

    getEntriesByFormIdAndTimeRange(formId: string, start: number, end: number): Promise<JournalEntry[]>;

    createEntry(entry: JournalEntry): Promise<void>;

    updateEntry(entry: JournalEntry): Promise<void>;

    deleteEntryById(id: string): Promise<void>;

    deleteEntriesByFormId(formId: string): Promise<void>;

    getEntryById(id: string): Promise<JournalEntry | undefined>;
}


export type IndexUpdateListener = (index: VariableIndex) => Promise<void>;
export type IndexDeleteListener = (index: VariableIndex) => Promise<void>;
export interface IndexCollection {
    getIndexByVariableAndTimeScope(variableId: string, timeScope: string): Promise<VariableIndex | undefined>;

    createIndex(index: VariableIndex): Promise<void>;

    updateIndex(index: VariableIndex): Promise<void>;

    getIndicesByVariableId(variableId: string): Promise<VariableIndex[]>;

    deleteIndicesByVariableId(id: string): Promise<void>;

    updateIndices(indices: VariableIndex[]): Promise<void>;

    deleteIndicesByIds(ids: string[]): Promise<void>;

    addUpdateListener(listener: IndexUpdateListener): void;

    removeUpdateListener(listener: IndexUpdateListener): void;

    addDeleteListener(listener: IndexDeleteListener): void;

    removeDeleteListener(listener: IndexDeleteListener): void;

}
