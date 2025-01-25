import {AsyncStore} from "@perfice/stores/store";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {JournalService} from "@perfice/services/journal/journal";
import {resolvedPromise} from "@perfice/util/promise";
import {updateIdentifiedInArray} from "@perfice/util/array";
import type {Form} from "@perfice/model/form/form";
import type { PrimitiveValue } from "@perfice/model/primitive/primitive";

const PAGE_SIZE = 30;

export class JournalEntryStore extends AsyncStore<JournalEntry[]> {

    private journalService: JournalService;

    private page: number = 0;

    constructor(journalService: JournalService) {
        super(resolvedPromise([]));
        this.journalService = journalService;
    }

    async init() {
        this.setResolved([]);
        this.page = 0;
        await this.nextPage();
    }

    async nextPage() {
        let nextEntries = await this.journalService.getEntriesByOffsetAndLimit(this.page, PAGE_SIZE);
        if (nextEntries.length == 0) return;

        this.updateResolved(v => [...v, ...nextEntries]);
        this.page++;
    }

    async logEntry(form: Form, answers: Record<string, PrimitiveValue>, timestamp: number): Promise<void> {
        let entry = await this.journalService.logEntry(form, answers, timestamp);
        this.updateResolved(v => [...v, entry]);
    }

    async deleteEntryById(id: string) {
        await this.journalService.deleteEntryById(id);
        this.updateResolved(v => v.filter(e => e.id != id));
    }

    async updateEntry(entry: JournalEntry) {
        await this.journalService.updateEntry(entry);
        this.updateResolved(v => updateIdentifiedInArray(v, entry));
    }


}
