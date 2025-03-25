import { writable, type Writable } from "svelte/store";
import { dateToMidnight } from "@perfice/util/time/simple";
import { AsyncStore } from "@perfice/stores/store";
import { resolvedPromise } from "@perfice/util/promise";
import { EntityObserverType } from "@perfice/services/observer";
import type { TagService } from "@perfice/services/tag/tag";
import type { Tag } from "@perfice/model/tag/tag";
import { deleteIdentifiedInArray, updateIdentifiedInArray } from "@perfice/util/array";

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

    async logTag(tag: Tag, date: Date) {
        await this.tagService.logTag(tag, date);
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

}
