import type {TagEntry} from "@perfice/model/journal/journal";
import {AsyncStore} from "@perfice/stores/store";
import type {TagEntryService} from "@perfice/services/tag/entry";
import {emptyPromise} from "@perfice/util/promise";

export interface ITagEntryStore extends AsyncStore<TagEntry[]> {
    init(): Promise<void>;

    nextPage(page: number, size: number, lastId: string): Promise<TagEntry[]>;

    deleteEntryById(id: string): Promise<void>;
}

export class TagEntryStore extends AsyncStore<TagEntry[]> implements ITagEntryStore {

    private tagEntryService: TagEntryService;

    constructor(tagEntryService: TagEntryService) {
        super(emptyPromise());
        this.tagEntryService = tagEntryService;
    }

    async init() {
        this.setResolved([]);
    }

    async nextPage(page: number, size: number, lastId: string): Promise<TagEntry[]> {
        return await this.tagEntryService.getEntriesUntilTimeAndLimit(page, size, lastId);
    }

    async deleteEntryById(id: string) {
        await this.tagEntryService.deleteEntryById(id);
        this.updateResolved(v => v.filter(e => e.id != id));
    }
}