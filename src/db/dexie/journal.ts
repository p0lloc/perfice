import type {JournalCollection} from "@perfice/db/collections";
import type {JournalEntry} from "@perfice/model/journal/journal";
import {SyncedTable} from "@perfice/services/sync/sync";

export class DexieJournalCollection implements JournalCollection {

    private readonly table: SyncedTable<JournalEntry>;

    constructor(table: SyncedTable<JournalEntry>) {
        this.table = table;
    }

    async getAllEntriesByFormId(formId: string): Promise<JournalEntry[]> {
        return this.table.where("formId").equals(formId).toArray();
    }

    async getEntriesByFormIdAndTimeRange(formId: string, start: number, end: number): Promise<JournalEntry[]> {
        return this.table.where("[formId+timestamp]").between([formId, start], [formId, end], true, true)
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
        await this.table.create(entry);
    }

    async updateEntry(entry: JournalEntry): Promise<void> {
        await this.table.put(entry);
    }

    async deleteEntryById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }

    async deleteEntriesByFormId(formId: string): Promise<void> {
        let byForm = await this.table.where("formId").equals(formId).toArray();
        await this.table.deleteByIds(byForm.map(e => e.id));
    }

    async getEntryById(id: string): Promise<JournalEntry | undefined> {
        return this.table.getById(id);
    }

    async getEntriesBySnapshotId(snapshotId: string): Promise<JournalEntry[]> {
        return this.table.where("snapshotId").equals(snapshotId).toArray();
    }

    async clear(): Promise<void> {
        await this.table.clear();
    }

    async createEntries(entries: JournalEntry[]): Promise<void> {
        await this.table.bulkCreate(entries);
    }

    async getAllEntries(): Promise<JournalEntry[]> {
        return this.table.getAll();
    }

    async getEntriesByFormId(formId: string): Promise<JournalEntry[]> {
        return this.table.where("formId").equals(formId).toArray();
    }

    async getEntriesByTimeRange(start: number, end: number): Promise<JournalEntry[]> {
        return this.table
            .where("timestamp").between(start, end, true, true)
            .toArray();
    }

    async getEntriesUntilTimeAndLimit(untilTimestamp: number, limit: number, lastId: string = "\uffff"): Promise<JournalEntry[]> {
        // We sort by both timestamp and id so that we get deterministic results when entries have the same timestamp
        // This returns the newest entries first
        return this.table
            .where("[timestamp+id]")
            .below([untilTimestamp, lastId]) // If we are exactly at the boundary point we need to compare by id of last journal entry instead
            .limit(limit)
            .reverse()
            .toArray();
    }

    getEntryByIntegrationIdentifier(identifier: string): Promise<JournalEntry | undefined> {
        return this.table.where("integration").equals(identifier).first();
    }

}
