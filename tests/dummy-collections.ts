import {
    IndexCollection,
    IndexUpdateListener,
    JournalCollection, TagEntryCollection, TrackableCollection,
    VariableCollection
} from "../src/db/collections";
import {StoredVariable, VariableIndex} from "../src/model/variable/variable";
import {updateIdentifiedInArray} from "../src/util/array";
import {JournalEntry, TagEntry} from "../src/model/journal/journal";
import {FormService} from "../src/services/form/form";
import {Form, FormSnapshot} from "../src/model/form/form";
import {JournalService} from "../src/services/journal/journal";
import {EntityObserverCallback, EntityObserverType} from "../src/services/observer";
import {Trackable} from "../src/model/trackable/trackable";

export class DummyJournalCollection implements JournalCollection {
    private entries: JournalEntry[];

    constructor(entries: JournalEntry[] = []) {
        this.entries = entries;
    }

    clear(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    createEntries(entries: JournalEntry[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getAllEntries(): Promise<JournalEntry[]> {
        throw new Error("Method not implemented.");
    }
    getEntriesByFormId(formId: string): Promise<JournalEntry[]> {
        throw new Error("Method not implemented.");
    }

    async getEntriesByFormIdUntilTime(formId: string, upper: number): Promise<JournalEntry[]> {
        return this.entries.filter(e => e.formId == formId && e.timestamp <= upper);
    }

    async getEntriesByFormIdFromTime(formId: string, lower: number): Promise<JournalEntry[]> {
        return this.entries.filter(e => e.formId == formId && e.timestamp >= lower);
    }

    async createEntry(entry: JournalEntry) {
        this.entries.push(entry);
    }

    async getAllEntriesByFormId(formId: string): Promise<JournalEntry[]> {
        return this.entries.filter(e => e.formId == formId);
    }

    async getEntriesByFormIdAndTimeRange(formId: string, start: number, end: number): Promise<JournalEntry[]> {
        return this.entries.filter(e => e.formId == formId && e.timestamp >= start && e.timestamp <= end);
    }

    async updateEntry(entry: JournalEntry): Promise<void> {
        this.entries = updateIdentifiedInArray(this.entries, entry);
    }

    async deleteEntriesByFormId(formId: string): Promise<void> {
        this.entries = this.entries.filter(e => e.formId != formId);
    }

    async getEntryById(id: string): Promise<JournalEntry | undefined> {
        return this.entries.find(e => e.id == id);
    }

    async deleteEntryById(id: string): Promise<void> {
        this.entries = this.entries.filter(e => e.id != id);
    }

    getEntriesBySnapshotId(snapshotId: string): Promise<JournalEntry[]> {
        throw new Error("Method not implemented.");
    }

    getEntriesByOffsetAndLimit(offset: number, limit: number): Promise<JournalEntry[]> {
        throw new Error("Method not implemented.");
    }

}

export class DummyTagEntryCollection implements TagEntryCollection {

    private entries: TagEntry[];

    constructor(entries: TagEntry[] = []) {
        this.entries = entries;
    }

    async getEntryById(entryId: string): Promise<TagEntry | undefined> {
        return this.entries.find(e => e.id == entryId);
    }

    async deleteEntryById(id: string): Promise<void> {
        this.entries = this.entries.filter(e => e.id != id);
    }

    async createEntry(entry: TagEntry): Promise<void> {
        this.entries.push(entry);
    }

    async getTagEntriesByTagId(tagId: string): Promise<TagEntry[]> {
        return this.entries.filter(e => e.tagId == tagId);
    }

    async getAllEntriesByTagId(tagId: string): Promise<TagEntry[]> {
        return this.entries.filter(e => e.tagId == tagId);
    }

    async getEntriesByTagIdAndTimeRange(tagId: string, start: number, end: number): Promise<TagEntry[]> {
        return this.entries.filter(e => e.tagId == tagId && e.timestamp >= start && e.timestamp <= end);
    }

    async getEntriesByTagIdFromTime(tagId: string, lower: number): Promise<TagEntry[]> {
        return this.entries.filter(e => e.tagId == tagId && e.timestamp >= lower);
    }

    async getEntriesByTagIdUntilTime(tagId: string, upper: number): Promise<TagEntry[]> {
        return this.entries.filter(e => e.tagId == tagId && e.timestamp <= upper);
    }

    async deleteEntriesByTagId(tagId: string): Promise<void> {
        this.entries = this.entries.filter(e => e.tagId != tagId);
    }
}


export class DummyIndexCollection implements IndexCollection {

    private indices: VariableIndex[];
    private updateListeners: IndexUpdateListener[] = [];
    private deleteListeners: IndexUpdateListener[] = [];

    constructor(indices: VariableIndex[] = []) {
        this.indices = indices;
    }

    async deleteIndicesByVariableIds(variablesToDelete: string[]): Promise<void> {
        let toDelete = this.indices.filter(i => variablesToDelete.includes(i.variableId));
        this.indices = this.indices.filter(i => !toDelete.includes(i));
        await this.notifyDeletion(toDelete);
    }


    private async notifyDeletion(indices: VariableIndex[]){
        for (let index of indices) {
            for (const callback of this.deleteListeners) {
                await callback(index);
            }
        }
    }

    async deleteIndicesByIds(ids: string[]): Promise<void> {
        let toDelete = this.indices.filter(i => ids.includes(i.id));
        this.indices = this.indices.filter(i => !toDelete.includes(i));
        await this.notifyDeletion(toDelete);
    }


    async getIndicesByVariableId(variableId: string): Promise<VariableIndex[]> {
        return this.indices.filter(i => i.variableId == variableId);
    }

    async getIndexByVariableAndTimeScope(variableId: string, timeScope: string): Promise<VariableIndex | undefined> {
        return this.indices.find(i => i.variableId == variableId
            && i.timeScope == timeScope);
    }

    async createIndex(index: VariableIndex): Promise<void> {
        this.indices.push(index);
    }

    async updateIndices(indices: VariableIndex[]): Promise<void> {
        for (let index of indices) {
            await this.updateIndex(index);
        }
    }

    async updateIndex(index: VariableIndex): Promise<void> {
        this.indices = updateIdentifiedInArray(this.indices, index);
        for (const callback of this.updateListeners) {
            await callback(index);
        }
    }

    async deleteIndicesByVariableId(id: string): Promise<void> {
        let toDelete = this.indices.filter(i => i.variableId == id);
        this.indices = this.indices.filter(i => !toDelete.includes(i));
        await this.notifyDeletion(toDelete);
    }

    addUpdateListener(listener: IndexUpdateListener) {
        this.updateListeners.push(listener);
    }

    removeUpdateListener(listener: IndexUpdateListener) {
        this.updateListeners = this.updateListeners.filter(l => l != listener);
    }

    addDeleteListener(listener: IndexUpdateListener) {
        this.deleteListeners.push(listener);
    }

    removeDeleteListener(listener: IndexUpdateListener) {
        this.deleteListeners = this.deleteListeners.filter(l => l != listener);
    }

}

export class DummyTrackableCollection implements TrackableCollection {
    private trackables: Trackable[] = [];

    constructor(trackables: Trackable[] = []) {
        this.trackables = trackables;
    }

    count(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    updateTrackables(items: Trackable[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async getTrackables(): Promise<Trackable[]> {
        return this.trackables;
    }

    async getTrackableById(id: string): Promise<Trackable | undefined> {
        return this.trackables.find(t => t.id == id);
    }

    async createTrackable(trackable: Trackable): Promise<void> {
        this.trackables.push(trackable);
    }

    async updateTrackable(trackable: Trackable): Promise<void> {
        this.trackables = updateIdentifiedInArray(this.trackables, trackable);
    }

    async deleteTrackableById(trackableId: string): Promise<void> {
        this.trackables = this.trackables.filter(t => t.id != trackableId);
    }
}

export class DummyFormService implements FormService {

    private forms: Form[];

    constructor(forms: Form[] = []) {
        this.forms = forms;
    }

    initLazyDependencies(journalService: JournalService): void {
        throw new Error("Method not implemented.");
    }

    async getForms(): Promise<Form[]> {
        return this.forms;
    }

    async getFormById(id: string): Promise<Form | undefined> {
        return this.forms.find(f => f.id == id);
    }

    getFormSnapshotById(id: string): Promise<FormSnapshot | undefined> {
        throw new Error("Method not implemented.");
    }

    async createForm(form: Form): Promise<void> {
        this.forms.push(form);
    }

    async updateForm(form: Form): Promise<void> {
        this.forms = updateIdentifiedInArray(this.forms, form);
    }

    deleteFormById(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Form>): void {
        throw new Error("Method not implemented.");
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Form>): void {
        throw new Error("Method not implemented.");
    }
}

export class DummyVariableCollection implements VariableCollection {
    private variables: StoredVariable[];

    constructor(variables: StoredVariable[] = []) {
        this.variables = variables;
    }

    async getVariables(): Promise<StoredVariable[]> {
        return this.variables;
    }

    async getVariableById(id: string): Promise<StoredVariable | undefined> {
        return this.variables.find(v => v.id == id);
    }

    async createVariable(stored: StoredVariable): Promise<void> {
        this.variables.push(stored);
    }

    async deleteVariableById(variableId: string): Promise<void> {
        this.variables = this.variables.filter(v => v.id != variableId);
    }

    async updateVariable(variable: StoredVariable): Promise<void> {
        this.variables = updateIdentifiedInArray(this.variables, variable);
    }
}
