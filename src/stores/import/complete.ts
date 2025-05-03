import type {CompleteImportService} from "@perfice/services/import/complete/complete";

export class CompleteImportStore {

    private readonly importService: CompleteImportService;

    constructor(importService: CompleteImportService) {
        this.importService = importService;
    }

    async import(file: File, newFormat: boolean) {
        await this.importService.import(file, newFormat);
        window.location.href = "/";
    }

}