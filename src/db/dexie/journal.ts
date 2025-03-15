import type {JournalCollection} from "@perfice/db/collections";
import type {EntityTable} from "dexie";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";

export class DexieJournalCollection implements JournalCollection {

    private readonly table: EntityTable<JournalEntry, "id">;

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

    // TODO: should we filter by formId first and instead do time filtering in javascript?

    async getEntriesByFormIdFromTime(formId: string, start: number): Promise<JournalEntry[]> {
        return this.table.where("timestamp")
            .aboveOrEqual(start)
            .and(v => v.formId == formId)
            .toArray();
    }

    async getEntriesFromTime(start: number): Promise<JournalEntry[]> {
        return this.table.where("timestamp")
            .aboveOrEqual(start)
            .toArray();
    }

    async getEntriesByFormIdUntilTime(formId: string, start: number): Promise<JournalEntry[]> {
        return this.table.where("timestamp")
            .belowOrEqual(start)
            .and(v => v.formId == formId)
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

    async getEntriesBySnapshotId(snapshotId: string): Promise<JournalEntry[]> {
        return this.table.where("snapshotId").equals(snapshotId).toArray();
    }

    async clear(): Promise<void> {
        await this.table.clear();
    }

    async createEntries(entries: JournalEntry[]): Promise<void> {
        await this.table.bulkAdd(entries);
    }

    async getAllEntries(): Promise<JournalEntry[]> {
        return this.table.toArray();
    }

    async getEntriesByFormId(formId: string): Promise<JournalEntry[]> {
        return this.table.where("formId").equals(formId).toArray();
    }

    async getEntriesByTimeRange(start: number, end: number): Promise<JournalEntry[]> {
        return this.table
            .where("timestamp").between(start, end, true, true)
            .toArray();
    }

    async getEntriesUntilTimeAndLimit(untilTimestamp: number, limit: number): Promise<JournalEntry[]> {
        // We sort by both timestamp and id so that we get deterministic results when entries have the same timestamp
        // This returns the newest entries first
        return this.table
            .where("[timestamp+id]")
            .belowOrEqual([untilTimestamp, ""])
            .limit(limit)
            .reverse()
            .toArray();
    }

}
