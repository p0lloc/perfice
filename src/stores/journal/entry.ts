import {AsyncStore} from "@perfice/stores/store";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {JournalService} from "@perfice/services/journal/journal";
import {emptyPromise} from "@perfice/util/promise";
import {updateIdentifiedInArray} from "@perfice/util/array";

export class JournalEntryStore extends AsyncStore<JournalEntry[]> {

    private journalService: JournalService;

    constructor(journalService: JournalService) {
        super(emptyPromise());
        this.journalService = journalService;
    }

    async logEntry(entry: JournalEntry): Promise<void> {
        await this.journalService.logEntry(entry);
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
