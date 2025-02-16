import type { JournalEntry, TagEntry } from "@perfice/model/journal/journal";
import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {StoredVariable, VariableIndex} from "@perfice/model/variable/variable";
import type {Form, FormSnapshot} from "@perfice/model/form/form";
import type { Goal } from "@perfice/model/goal/goal";
import type { Tag } from "@perfice/model/tag/tag";

export interface TrackableCollection {
    getTrackables(): Promise<Trackable[]>;
    getTrackableById(id: string): Promise<Trackable | undefined>;
    createTrackable(trackable: Trackable): Promise<void>;
    updateTrackable(trackable: Trackable): Promise<void>;
    deleteTrackableById(trackableId: string): Promise<void>;
    updateTrackables(items: Trackable[]): Promise<void>;
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

export interface FormSnapshotCollection {
    getFormSnapshots(): Promise<FormSnapshot[]>;

    getFormSnapshotById(id: string): Promise<FormSnapshot | undefined>;

    createFormSnapshot(snapshot: FormSnapshot): Promise<void>;

    deleteFormSnapshotsByFormId(formId: string): Promise<void>;

    updateFormSnapshot(snapshot: FormSnapshot): Promise<void>;
}

export interface GoalCollection {
    getGoals(): Promise<Goal[]>;

    getGoalById(id: string): Promise<Goal | undefined>;

    createGoal(goal: Goal): Promise<void>;

    updateGoal(goal: Goal): Promise<void>;

    deleteGoalById(id: string): Promise<void>;
}

export interface JournalCollection {
    getEntriesByOffsetAndLimit(offset: number, limit: number): Promise<JournalEntry[]>;

    getAllEntriesByFormId(formId: string): Promise<JournalEntry[]>;

    getEntriesByFormIdAndTimeRange(formId: string, start: number, end: number): Promise<JournalEntry[]>;

    getEntriesByFormIdUntilTime(formId: string, upper: number): Promise<JournalEntry[]>;

    getEntriesByFormIdFromTime(formId: string, lower: number): Promise<JournalEntry[]>;

    createEntry(entry: JournalEntry): Promise<void>;

    updateEntry(entry: JournalEntry): Promise<void>;

    deleteEntryById(id: string): Promise<void>;

    deleteEntriesByFormId(formId: string): Promise<void>;

    getEntryById(id: string): Promise<JournalEntry | undefined>;

    getEntriesBySnapshotId(snapshotId: string): Promise<JournalEntry[]>;
}

export type IndexUpdateListener = (index: VariableIndex) => Promise<void>;
export type IndexDeleteListener = (index: VariableIndex) => Promise<void>;

export interface TagCollection {
    getTags(): Promise<Tag[]>;

    getTagById(id: string): Promise<Tag | undefined>;

    createTag(tag: Tag): Promise<void>;

    updateTag(tag: Tag): Promise<void>;

    deleteTagById(id: string): Promise<void>;
}

export interface TagEntryCollection {
    getTagEntriesByTagId(tagId: string): Promise<TagEntry[]>;

    getAllEntriesByTagId(tagId: string): Promise<TagEntry[]>;

    getEntriesByTagIdAndTimeRange(tagId: string, start: number, end: number): Promise<TagEntry[]>;

    getEntriesByTagIdUntilTime(tagId: string, upper: number): Promise<TagEntry[]>;

    getEntriesByTagIdFromTime(tagId: string, lower: number): Promise<TagEntry[]>;

    deleteEntryById(id: string): Promise<void>;

    deleteEntriesByTagId(tagId: string): Promise<void>;

    createEntry(entry: TagEntry): Promise<void>;
}

export interface IndexCollection {
    getIndexByVariableAndTimeScope(variableId: string, timeScope: string): Promise<VariableIndex | undefined>;

    createIndex(index: VariableIndex): Promise<void>;

    updateIndex(index: VariableIndex): Promise<void>;

    getIndicesByVariableId(variableId: string): Promise<VariableIndex[]>;

    deleteIndicesByVariableId(id: string): Promise<void>;

    updateIndices(indices: VariableIndex[]): Promise<void>;

    deleteIndicesByIds(ids: string[]): Promise<void>;

    deleteIndicesByVariableIds(variablesToDelete: string[]): Promise<void>;

    addUpdateListener(listener: IndexUpdateListener): void;

    removeUpdateListener(listener: IndexUpdateListener): void;

    addDeleteListener(listener: IndexDeleteListener): void;

    removeDeleteListener(listener: IndexDeleteListener): void;

}
