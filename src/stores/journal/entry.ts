import {AsyncStore} from "@perfice/stores/store";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {JournalService} from "@perfice/services/journal/journal";
import {emptyPromise, resolvedPromise} from "@perfice/util/promise";
import {updateIdentifiedInArray} from "@perfice/util/array";
import type {Form} from "@perfice/model/form/form";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {TextOrDynamic} from "@perfice/model/variable/variable";

export class JournalEntryStore extends AsyncStore<JournalEntry[]> {

    private journalService: JournalService;

    constructor(journalService: JournalService) {
        super(emptyPromise());
        this.journalService = journalService;
    }

    async init() {
        this.setResolved([]);
    }

    async nextPage(page: number, size: number): Promise<JournalEntry[]> {
        return await this.journalService.getEntriesUntilTimeAndLimit(page, size);
    }

    async logEntry(form: Form, answers: Record<string, PrimitiveValue>, format: TextOrDynamic[], timestamp: number): Promise<void> {
        let entry = await this.journalService.logEntry(form, answers, format, timestamp);
        this.updateResolved(v => [...v, entry]);
    }

    async getEntryById(id: string): Promise<JournalEntry | undefined> {
        return this.journalService.getEntryById(id);
    }

    async deleteEntryById(id: string) {
        await this.journalService.deleteEntryById(id);
        this.updateResolved(v => v.filter(e => e.id != id));
    }

    async updateEntry(entry: JournalEntry, format: TextOrDynamic[]) {
        await this.journalService.updateEntry(entry, format);
        this.updateResolved(v => updateIdentifiedInArray(v, entry));
    }

}
