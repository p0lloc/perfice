import {IndexCollection, JournalCollection} from "../src/db/collections";
import {VariableIndex} from "../src/model/variable/variable";
import {updateIdentifiedInArray} from "../src/util/array";
import {JournalEntry} from "../src/model/journal/journal";
import {pDisplay, pNumber, pString} from "../src/model/primitive/primitive";

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

}

export class DummyIndexCollection implements IndexCollection {

    private indices: VariableIndex[];

    constructor(indices: VariableIndex[] = []) {
        this.indices = indices;
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

    async updateIndex(index: VariableIndex): Promise<void> {
        this.indices = updateIdentifiedInArray(this.indices, index);
    }

    async deleteIndicesByVariableId(id: string): Promise<void> {
        this.indices = this.indices.filter(i => i.variableId != id);
    }

}
