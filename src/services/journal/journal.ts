import type {JournalCollection} from "@perfice/db/collections";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {Form} from "@perfice/model/form/form";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

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

export class JournalService {

    private collection: JournalCollection;
    private observers: JournalEntryObserver[];

    constructor(collection: JournalCollection) {
        this.collection = collection;
        this.observers = [];
    }

    async getEntriesByOffsetAndLimit(offset: number, limit: number): Promise<JournalEntry[]> {
        return this.collection.getEntriesByOffsetAndLimit(offset, limit);
    }

    async logEntry(form: Form, answers: Record<string, PrimitiveValue>, timestamp: number): Promise<JournalEntry> {
        let entry = {
            id: crypto.randomUUID(),
            formId: form.id,
            snapshotId: form.snapshotId,
            answers,
            timestamp,
            name: form.name,
            icon: form.icon
        }

        await this.collection.createEntry(entry);
        await this.notifyObservers(JournalEntryObserverType.CREATED, entry);
        return entry;
    }

    async updateEntry(entry: JournalEntry) {
        await this.collection.updateEntry(entry);
        await this.notifyObservers(JournalEntryObserverType.UPDATED, entry);
    }

    async deleteEntry(entry: JournalEntry) {
        await this.collection.deleteEntryById(entry.id);
        await this.notifyObservers(JournalEntryObserverType.DELETED, entry);
    }

    async deleteEntryById(id: string) {
        let entry = await this.collection.getEntryById(id);
        if(entry == undefined) return;

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

}
