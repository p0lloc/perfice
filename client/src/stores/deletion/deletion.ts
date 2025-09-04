import type {DeletionService} from "@perfice/services/deletion/deletion";

export class DeletionStore {

    private readonly deletionService: DeletionService;

    constructor(deletionService: DeletionService) {
        this.deletionService = deletionService;
    }

    async deleteAllData() {
        await this.deletionService.deleteAllData();
    }

}