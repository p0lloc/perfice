import type {JournalCollection} from "@perfice/db/collections";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {Form} from "@perfice/model/form/form";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {formatAnswersIntoRepresentation} from "@perfice/model/trackable/ui";
import type {TextOrDynamic} from "@perfice/model/variable/variable";

export enum JournalEntryObserverType {
    CREATED,
    UPDATED,
    DELETED,
    ANY,
}

export type JournalEntryObserverCallback = (e: JournalEntry) => Promise<void>;

export interface JournalEntryObserver {
    type: JournalEntryObserverType;
    callback: JournalEntryObserverCallback;
}

export interface JournalService {
    getEntryById(id: string): Promise<JournalEntry | undefined>;

    getEntriesUntilTimeAndLimit(untilTimestamp: number, limit: number): Promise<JournalEntry[]>;

    logEntry(form: Form, answers: Record<string, PrimitiveValue>, format: TextOrDynamic[], timestamp: number): Promise<JournalEntry>;

    updateEntry(entry: JournalEntry, format: TextOrDynamic[]): Promise<void>;

    deleteEntry(entry: JournalEntry): Promise<void>;

    deleteEntryById(id: string): Promise<void>;

    getEntriesBySnapshotId(snapshotId: string): Promise<JournalEntry[]>;

    addEntryObserver(type: JournalEntryObserverType, callback: JournalEntryObserverCallback): void;

    import(entries: JournalEntry[], overwrite: boolean): Promise<void>;

    getAllEntries(): Promise<JournalEntry[]>;

    getEntriesByFormId(formId: string): Promise<JournalEntry[]>;

    getEntriesFromTime(lower: number): Promise<JournalEntry[]>;

    getEntriesByFormIdFromTime(formId: string, lower: number): Promise<JournalEntry[]>;

    deleteEntriesByFormId(id: string): Promise<void>;
}

export class BaseJournalService implements JournalService {

    private collection: JournalCollection;
    private observers: JournalEntryObserver[];

    constructor(collection: JournalCollection) {
        this.collection = collection;
        this.observers = [];
    }

    async deleteEntriesByFormId(id: string): Promise<void> {
        await this.collection.deleteEntriesByFormId(id);
    }

    getEntryById(id: string) {
        return this.collection.getEntryById(id);
    }

    async getEntriesUntilTimeAndLimit(untilTimestamp: number, limit: number): Promise<JournalEntry[]> {
        return this.collection.getEntriesUntilTimeAndLimit(untilTimestamp, limit);
    }

    async logEntry(form: Form, answers: Record<string, PrimitiveValue>, format: TextOrDynamic[], timestamp: number): Promise<JournalEntry> {
        let entry: JournalEntry = {
            id: crypto.randomUUID(),
            formId: form.id,
            snapshotId: form.snapshotId,
            answers,
            timestamp,
            displayValue: formatAnswersIntoRepresentation(answers, format)
        }

        await this.collection.createEntry(entry);
        await this.notifyObservers(JournalEntryObserverType.CREATED, entry);
        return entry;
    }

    async updateEntry(entry: JournalEntry, format: TextOrDynamic[]) {
        entry.displayValue = formatAnswersIntoRepresentation(entry.answers, format);

        await this.collection.updateEntry(entry);
        await this.notifyObservers(JournalEntryObserverType.UPDATED, entry);
    }

    async deleteEntry(entry: JournalEntry) {
        await this.collection.deleteEntryById(entry.id);
        await this.notifyObservers(JournalEntryObserverType.DELETED, entry);
    }

    async deleteEntryById(id: string) {
        let entry = await this.collection.getEntryById(id);
        if (entry == undefined) return;

        await this.deleteEntry(entry);
    }

    async getEntriesBySnapshotId(snapshotId: string): Promise<JournalEntry[]> {
        return this.collection.getEntriesBySnapshotId(snapshotId);
    }

    private async notifyObservers(type: JournalEntryObserverType, entry: JournalEntry) {
        let observers = this.observers
            .filter(o => o.type == JournalEntryObserverType.ANY || o.type == type);

        for (const o of observers) {
            // TODO: are there any implications of awaiting async observers?
            await o.callback(entry);
        }
    }

    addEntryObserver(type: JournalEntryObserverType, callback: JournalEntryObserverCallback) {
        this.observers.push({type, callback});
    }

    async import(entries: JournalEntry[], overwrite: boolean) {
        if (entries.length == 0) return;
        if (overwrite) {
            await this.collection.deleteEntriesByFormId(entries[0].formId);
        }

        await this.collection.createEntries(entries);
    }

    async getAllEntries(): Promise<JournalEntry[]> {
        return this.collection.getAllEntries();
    }

    async getEntriesByFormId(formId: string): Promise<JournalEntry[]> {
        return this.collection.getEntriesByFormId(formId);
    }

    getEntriesFromTime(lower: number): Promise<JournalEntry[]> {
        return this.collection.getEntriesFromTime(lower);
    }

    getEntriesByFormIdFromTime(formId: string, lower: number): Promise<JournalEntry[]> {
        return this.collection.getEntriesByFormIdFromTime(formId, lower);
    }

}
