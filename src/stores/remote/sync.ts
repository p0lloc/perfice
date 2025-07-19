import type {SyncService} from "@perfice/services/sync/sync";

import {writable} from "svelte/store";
import type {EncryptionService} from "@perfice/services/encryption/encryption";

export const confirmEncryptionEvents = writable<boolean[]>([]);

export class SyncStore {
    private syncService: SyncService;
    private encryptionService: EncryptionService;

    constructor(syncService: SyncService, encryptionService: EncryptionService) {
        this.syncService = syncService;
        this.encryptionService = encryptionService;
    }

    async fullPull(overwrite: boolean) {
        await this.syncService.fullPull(undefined, overwrite);
    }

    async fullPush() {
        await this.syncService.fullPush();
    }

    async calculateChecksums() {
        return await this.syncService.calculateChecksums();
    }

    async confirmEncryptionPassword(password: string) {
        await this.encryptionService.setPassword(password, await this.syncService.getSalt());
        return await this.syncService.pull();
    }

    async resetEncryptionPassword(password: string) {
        await this.encryptionService.setPassword(password, await this.syncService.getSalt());
        await this.syncService.updateKey();
    }

    async onSyncEnabled() {
        return await this.syncService.pull();
    }

    async refresh() {
        await this.syncService.sync();
    }


}