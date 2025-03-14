import type {TagEntry} from "@perfice/model/journal/journal";
import {AsyncStore} from "@perfice/stores/store";
import type {TagEntryService} from "@perfice/services/tag/entry";
import {resolvedPromise} from "@perfice/util/promise";

const PAGE_SIZE = 30;

export class TagEntryStore extends AsyncStore<TagEntry[]> {

    private tagEntryService: TagEntryService;
    private page: number = 0;

    constructor(tagEntryService: TagEntryService) {
        super(resolvedPromise([]));
        this.tagEntryService = tagEntryService;
    }

    async init() {
        this.setResolved([]);
        this.page = 0;
        await this.nextPage();
    }

    async nextPage() {
        let nextEntries = await this.tagEntryService.getEntriesByOffsetAndLimit(this.page, PAGE_SIZE);
        if (nextEntries.length == 0) return;

        this.updateResolved(v => [...v, ...nextEntries]);
        this.page++;
    }

}