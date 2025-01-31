import {IndexCollection, IndexDeleteListener, IndexUpdateListener, JournalCollection} from "../src/db/collections";
import {VariableIndex} from "../src/model/variable/variable";
import {updateIdentifiedInArray} from "../src/util/array";
import {JournalEntry} from "../src/model/journal/journal";
import {FormService} from "../src/services/form/form";
import {Form, FormSnapshot} from "../src/model/form/form";
import {JournalService} from "../src/services/journal/journal";
import {EntityObserverCallback, EntityObserverType} from "../src/services/observer";

export class DummyJournalCollection implements JournalCollection {
    private entries: JournalEntry[];

    constructor(entries: JournalEntry[] = []) {
        this.entries = entries;
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

export class DummyIndexCollection implements IndexCollection {

    private indices: VariableIndex[];

    constructor(indices: VariableIndex[] = []) {
        this.indices = indices;
    }

    addDeleteListener(listener: IndexDeleteListener): void {
        throw new Error("Method not implemented.");
    }
    removeDeleteListener(listener: IndexDeleteListener): void {
        throw new Error("Method not implemented.");
    }

    async deleteIndicesByIds(ids: string[]): Promise<void> {
        this.indices = this.indices.filter(i => !ids.includes(i.id));
    }
    addUpdateListener(listener: IndexUpdateListener): void {
        throw new Error("Method not implemented.");
    }
    removeUpdateListener(listener: IndexUpdateListener): void {
        throw new Error("Method not implemented.");
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
    }

    async deleteIndicesByVariableId(id: string): Promise<void> {
        this.indices = this.indices.filter(i => i.variableId != id);
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
