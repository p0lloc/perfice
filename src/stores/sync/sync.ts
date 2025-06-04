import type {SyncService} from "@perfice/services/sync/sync";

export class SyncStore {
    private syncService: SyncService;

    constructor(syncService: SyncService) {
        this.syncService = syncService;
    }

    async fullPull(overwrite: boolean) {
        await this.syncService.fullPull(undefined, overwrite);
    }

    async calculateChecksums() {
        return await this.syncService.calculateChecksums();
    }

}