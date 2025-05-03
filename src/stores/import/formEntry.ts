import {writable} from "svelte/store";
import {publishToEventStore} from "@perfice/util/event";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {EntryImportService} from "@perfice/services/import/formEntries/import";

import {forms} from "@perfice/stores";

export interface ImportEvent {
    success: boolean;
    entryCount: number;
}

export const entryImportEvents = writable<ImportEvent[]>([]);

export class EntryImportStore {

    private currentImport: JournalEntry[] | null = null;
    private importService: EntryImportService;

    constructor(importService: EntryImportService) {
        this.importService = importService;
    }

    async importFile(file: File, formId: string) {

        let form = await forms.getFormById(formId);
        if (form == null) return;

        try {
            this.currentImport = await this.importService.readFile(file, form);
            publishToEventStore(entryImportEvents, {
                success: this.currentImport != null,
                entryCount: this.currentImport?.length ?? 0
            });
        } catch (e) {
            console.error(e);
            publishToEventStore(entryImportEvents, {
                success: false,
                entryCount: 0
            });
        }
    }

    async confirmImport(overwrite: boolean) {
        if (this.currentImport == null) return;

        // TODO: update variable indices
        await this.importService.finishImport(this.currentImport, overwrite);
    }

    discardImport() {
        this.currentImport = null;
    }
}
