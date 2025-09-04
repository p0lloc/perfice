import type {Tag, TagCategory} from "@perfice/model/tag/tag";
import type {TagCollection} from "@perfice/db/collections";
import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
import {TagVariableType} from "../variable/types/tag";
import type {VariableService} from "@perfice/services/variable/variable";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {TagEntryService} from "@perfice/services/tag/entry";

export interface TagEntityProvider {
    getTags(): Promise<Tag[]>;
}

export class TagService implements TagEntityProvider {
    private tagCollection: TagCollection;
    private variableService: VariableService;

    private tagEntryService: TagEntryService;

    private observers: EntityObservers<Tag>;

    constructor(tagCollection: TagCollection, variableService: VariableService, tagEntryService: TagEntryService) {
        this.tagCollection = tagCollection;
        this.variableService = variableService;
        this.tagEntryService = tagEntryService;
        this.observers = new EntityObservers();
    }

    async getTags(): Promise<Tag[]> {
        return await this.tagCollection.getTags();
    }

    async logTag(tagId: string, date: Date) {
        await this.tagEntryService.logTagEntry(tagId, date.getTime());
    }

    async getTagById(id: string): Promise<Tag | undefined> {
        return await this.tagCollection.getTagById(id);
    }

    async createTag(name: string, categoryId: string | null, id?: string): Promise<void> {
        let tagCount = await this.tagCollection.count();
        let tagId = id ?? crypto.randomUUID();
        let variable: Variable = {
            id: crypto.randomUUID(),
            name: "Tag",
            type: {
                type: VariableTypeName.TAG,
                value: new TagVariableType(tagId)
            }
        };

        let tag: Tag = {
            id: tagId,
            name,
            categoryId,
            variableId: variable.id,
            order: tagCount
        };

        await this.variableService.createVariable(variable);
        await this.tagCollection.createTag(tag);
        await this.observers.notifyObservers(EntityObserverType.CREATED, tag);
    }

    async updateTag(tag: Tag): Promise<void> {
        await this.tagCollection.updateTag(tag);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, tag);
    }

    async deleteTagById(id: string): Promise<void> {
        let tag = await this.tagCollection.getTagById(id);
        if (tag == null) return;

        await this.variableService.deleteVariableById(tag.variableId);
        await this.tagCollection.deleteTagById(id);
        await this.tagEntryService.deleteEntriesByTagId(id);
        await this.observers.notifyObservers(EntityObserverType.DELETED, tag);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Tag>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Tag>) {
        this.observers.removeObserver(type, callback);
    }

    async unlogTagEntry(entryId: string) {
        await this.tagEntryService.deleteEntryById(entryId);
    }

    async deleteTagsByCategoryId(categoryId: string) {
        let tags = await this.tagCollection.getTagsByCategoryId(categoryId);
        for (let tag of tags) {
            await this.deleteTagById(tag.id);
        }
    }

    async reorderTags(tags: Tag[], category: TagCategory | null) {
        for (let i = 0; i < tags.length; i++) {
            tags[i].order = i;

            // Category might have changed, update it
            tags[i].categoryId = category?.id ?? null;
        }

        await this.tagCollection.updateTags(tags);
    }
}
