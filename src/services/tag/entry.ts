import type {TagEntryCollection} from "@perfice/db/collections";
import type {TagEntry} from "@perfice/model/journal/journal";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";

export class TagEntryService {
    private tagEntryCollection: TagEntryCollection;
    private observers: EntityObservers<TagEntry>;

    constructor(tagEntryCollection: TagEntryCollection) {
        this.tagEntryCollection = tagEntryCollection;
        this.observers = new EntityObservers();
    }

    async getAllEntries(): Promise<TagEntry[]> {
        return this.tagEntryCollection.getAllEntries();
    }

    async logTagEntry(tagId: string, timestamp: number) {
        let entry: TagEntry = {
            id: crypto.randomUUID(),
            timestamp: timestamp,
            tagId: tagId,
        };

        await this.tagEntryCollection.createEntry(entry);
        await this.observers.notifyObservers(EntityObserverType.CREATED, entry);
    }

    async getEntriesUntilTimeAndLimit(untilTimestamp: number, limit: number): Promise<TagEntry[]> {
        return this.tagEntryCollection.getEntriesUntilTimeAndLimit(untilTimestamp, limit);
    }

    async deleteEntryById(entryId: string) {
        let entry = await this.tagEntryCollection.getEntryById(entryId);
        if (entry == undefined) return;
        await this.tagEntryCollection.deleteEntryById(entryId);
        await this.observers.notifyObservers(EntityObserverType.CREATED, entry);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<TagEntry>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<TagEntry>) {
        this.observers.removeObserver(type, callback);
    }

    async deleteEntriesByTagId(id: string) {
        await this.tagEntryCollection.deleteEntriesByTagId(id);
    }
}
