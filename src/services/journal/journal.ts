import type {JournalCollection} from "@perfice/db/collections";
import type {JournalEntry} from "@perfice/model/journal/journal";

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

    async logEntry(entry: JournalEntry) {
        await this.collection.createEntry(entry);
        await this.notifyObservers(JournalEntryObserverType.CREATED, entry);
    }

    async updateEntry(entry: JournalEntry) {
        await this.collection.updateEntry(entry);
        await this.notifyObservers(JournalEntryObserverType.UPDATED, entry);
    }

    async deleteEntry(entry: JournalEntry) {
        await this.collection.deleteEntryById(entry.id);
        await this.notifyObservers(JournalEntryObserverType.DELETED, entry);
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
