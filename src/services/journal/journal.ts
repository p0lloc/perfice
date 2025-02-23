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

    getEntryById(id: string) {
        return this.collection.getEntryById(id);
    }

    async logEntry(form: Form, answers: Record<string, PrimitiveValue>, format: TextOrDynamic[], timestamp: number): Promise<JournalEntry> {
        let entry: JournalEntry = {
            id: crypto.randomUUID(),
            formId: form.id,
            snapshotId: form.snapshotId,
            answers,
            timestamp,
            name: form.name,
            icon: form.icon,
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
        if (overwrite) {
            await this.collection.clear();
        }

        await this.collection.createEntries(entries);
    }

    async getAllEntries(): Promise<JournalEntry[]> {
        return this.collection.getAllEntries();
    }

    async getEntriesByFormId(formId: string): Promise<JournalEntry[]> {
        return this.collection.getEntriesByFormId(formId);
    }
}
