import type {JournalCollection} from "@perfice/db/collections";
import type {EntityTable} from "dexie";
import type {JournalEntry} from "@perfice/model/journal/journal";

export class DexieJournalCollection implements JournalCollection {

    private table: EntityTable<JournalEntry, "id">;

    constructor(table: EntityTable<JournalEntry, "id">) {
        this.table = table;
    }

    async getAllEntriesByFormId(formId: string): Promise<JournalEntry[]> {
        return this.table.where("formId").equals(formId).toArray();
    }

    async getEntriesByFormIdAndTimeRange(formId: string, start: number, end: number): Promise<JournalEntry[]> {
        return this.table.where("[formId+timestamp]").between([formId, start], [formId, end])
            .toArray();
    }

    async createEntry(entry: JournalEntry): Promise<void> {
        await this.table.add(entry);
    }

    async updateEntry(entry: JournalEntry): Promise<void> {
        await this.table.put(entry);
    }

    async deleteEntryById(id: string): Promise<void> {
        await this.table.delete(id);
    }

    async deleteEntriesByFormId(formId: string): Promise<void> {
        await this.table.where("formId").equals(formId).delete();
    }

    async getEntryById(id: string): Promise<JournalEntry | undefined> {
        return this.table.get(id);
    }

}
