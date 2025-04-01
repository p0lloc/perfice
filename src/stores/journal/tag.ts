import type {TagEntry} from "@perfice/model/journal/journal";
import {AsyncStore} from "@perfice/stores/store";
import type {TagEntryService} from "@perfice/services/tag/entry";
import {emptyPromise} from "@perfice/util/promise";

export class TagEntryStore extends AsyncStore<TagEntry[]> {

    private tagEntryService: TagEntryService;

    constructor(tagEntryService: TagEntryService) {
        super(emptyPromise());
        this.tagEntryService = tagEntryService;
    }

    async init() {
        this.setResolved([]);
    }

    async nextPage(page: number, size: number): Promise<TagEntry[]> {
        return await this.tagEntryService.getEntriesUntilTimeAndLimit(page, size);
    }

    async deleteEntryById(id: string) {
        await this.tagEntryService.deleteEntryById(id);
        this.updateResolved(v => v.filter(e => e.id != id));
    }
}