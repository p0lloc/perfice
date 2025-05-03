import type {EntryExportService} from "@perfice/services/export/formEntries/export";

export class EntryExportStore {

    private readonly exportService: EntryExportService;

    constructor(exportService: EntryExportService) {
        this.exportService = exportService;
    }

    async exportJson(formId: string) {
        return await this.exportService.exportJson(formId);
    }

    async exportCsv(formId: string) {
        return await this.exportService.exportCsv(formId);
    }

}
