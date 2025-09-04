import {writable, type Writable} from "svelte/store";
import {dateToMidnight} from "@perfice/util/time/simple";
import {AsyncStore} from "@perfice/stores/store";
import {resolvedPromise} from "@perfice/util/promise";
import {EntityObserverType} from "@perfice/services/observer";
import type {TagService} from "@perfice/services/tag/tag";
import type {Tag, TagCategory} from "@perfice/model/tag/tag";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";

export function TagDate(): Writable<Date> {
    return writable(dateToMidnight(new Date()));
}

export class TagStore extends AsyncStore<Tag[]> {

    private tagService: TagService;

    constructor(tagService: TagService) {
        super(tagService.getTags());
        this.tagService = tagService;

        this.tagService.addObserver(EntityObserverType.CREATED, async (tag) => await this.onTagCreated(tag));
        this.tagService.addObserver(EntityObserverType.UPDATED, async (tag) => await this.onTagUpdated(tag));
        this.tagService.addObserver(EntityObserverType.DELETED, async (tag) => await this.onTagDeleted(tag));
    }

    async load() {
        this.set(resolvedPromise(await this.tagService.getTags()));
    }

    async logTag(tagId: string, date: Date) {
        await this.tagService.logTag(tagId, date);
    }

    async unlogTagEntry(entryId: string) {
        await this.tagService.unlogTagEntry(entryId);
    }

    private async onTagCreated(goal: Tag) {
        this.updateResolved(v => [...v, goal]);
    }

    private async onTagUpdated(goal: Tag) {
        this.updateResolved(v => updateIdentifiedInArray(v, goal));
    }

    private async onTagDeleted(goal: Tag) {
        this.updateResolved(v => deleteIdentifiedInArray(v, goal.id));
    }

    async createTag(name: string, categoryId: string | null) {
        await this.tagService.createTag(name, categoryId);
    }

    async getTagById(id: string): Promise<Tag | undefined> {
        let tags = await this.get();
        return tags.find(t => t.id == id);
    }

    async updateTag(tag: Tag) {
        await this.tagService.updateTag(tag);
    }

    async deleteTag(tag: Tag) {
        await this.tagService.deleteTagById(tag.id);
    }

    async reorderTags(items: Tag[], category: TagCategory | null) {
        await this.tagService.reorderTags(items, category);
    }
}
