import type {TagEntryCollection} from "@perfice/db/collections";
import type {Tag} from "@perfice/model/tag/tag";
import type {TagEntry} from "@perfice/model/journal/journal";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";

export class TagEntryService {
    private tagEntryCollection: TagEntryCollection;
    private observers: EntityObservers<TagEntry>;

    constructor(tagEntryCollection: TagEntryCollection) {
        this.tagEntryCollection = tagEntryCollection;
        this.observers = new EntityObservers();
    }

    async logTagEntry(tag: Tag, timestamp: number) {
        let entry: TagEntry = {
            id: crypto.randomUUID(),
            timestamp: timestamp,
            tagId: tag.id,
        };

        await this.tagEntryCollection.createEntry(entry);
        await this.observers.notifyObservers(EntityObserverType.CREATED, entry);
    }

    async deleteEntryById(entryId: string) {
        let entry = await this.tagEntryCollection.getEntryById(entryId);
        if(entry == undefined) return;
        await this.tagEntryCollection.deleteEntryById(entryId);
        await this.observers.notifyObservers(EntityObserverType.CREATED, entry);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<TagEntry>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<TagEntry>) {
        this.observers.removeObserver(type, callback);
    }

}
