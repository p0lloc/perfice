import type {Tag} from "@perfice/model/tag/tag";
import type {TagCollection} from "@perfice/db/collections";
import {VariableTypeName, type Variable} from "@perfice/model/variable/variable";
import { TagVariableType } from "../variable/types/tag";
import type {VariableService} from "@perfice/services/variable/variable";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {TagEntryService} from "@perfice/services/tag/entry";

export class TagService {
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

    async logTag(tag: Tag, date: Date) {
        await this.tagEntryService.logTagEntry(tag, date.getTime());
    }

    async getTagById(id: string): Promise<Tag | undefined> {
        return await this.tagCollection.getTagById(id);
    }

    async createTag(name: string, categoryId: string | null): Promise<void> {
        let tagId = crypto.randomUUID();
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

        await this.variableService.deleteVariableAndDependencies(tag.variableId);
        await this.tagCollection.deleteTagById(id);
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

}
