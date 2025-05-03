import type {CompleteExportService} from "@perfice/services/export/complete/complete";

export class CompleteExportStore {

    private readonly exportService: CompleteExportService;

    constructor(exportService: CompleteExportService) {
        this.exportService = exportService;
    }

    async export() {
        return await this.exportService.export();
    }

}