import {
    type IncomingUpdate,
    type IncomingUpdateEntity,
    type OutgoingUpdate,
    type OutgoingUpdateDTO,
    type OutgoingUpdateEntity,
    type OutgoingUpdateEntityDTO,
    type PreprocessedEntity,
    UpdateOperation
} from "@perfice/model/sync/sync";
import type {EncryptionService} from "../encryption/encryption";
import type {MigrationService} from "@perfice/db/migration/migration";
import type {UpdateQueueCollection} from "@perfice/db/collections";
import type {Table, WhereClause} from "dexie";
import {type KyInstance} from "ky";
import {type RemoteService, RemoteType} from "@perfice/services/remote/remote";
import type {AuthService} from "@perfice/services/auth/auth";
import type {AuthenticatedUser} from "@perfice/model/auth/auth";

export class LazySyncServiceProvider {
    private syncService: SyncService | null = null;

    setSyncService(syncService: SyncService) {
        this.syncService = syncService;
    }

    getSyncService(): SyncService {
        if (this.syncService == null) {
            throw new Error("Sync service not set");
        }

        return this.syncService;
    }
}

async function calculateChecksum(array: any[]) {
    // Normalize each object: sort keys and stringify
    const normalizedObjects = array.map(obj => {
        const sortedEntries = Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
        return JSON.stringify(Object.fromEntries(sortedEntries));
    });

    // Sort normalized strings to make array order irrelevant
    const sortedStrings = normalizedObjects.sort();

    // Concatenate all strings
    const combined = sortedStrings.join('|');

    // Encode as UTF-8 and hash using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return checksum;
}

export const SYNCED_ENTITY_TYPES = [
    "trackables",
    "variables",
    "entries",
    "trackableCategories",
    "forms",
    "formSnapshots",
    //"indices",
    "goals",
    "tags",
    "tagEntries",
    "formTemplates",
    "tagCategories",
    "dashboards",
    "dashboardWidgets",
    "reflections",
    "savedSearches",
    "notifications",
    "analyticSettings"
];

const SALT_STORAGE_KEY = "salt";

export class SyncedTable<T extends { id: string }> {
    private table: Table<T, string>;
    private syncServiceProvider: LazySyncServiceProvider;
    private readonly entityType: string;

    constructor(table: Table<T, string>, entityType: string, syncServiceProvider: LazySyncServiceProvider) {
        this.table = table;
        this.entityType = entityType;
        this.syncServiceProvider = syncServiceProvider;
    }

    async getAll(): Promise<T[]> {
        return this.table.toArray();
    }

    async getById(id: string): Promise<T | undefined> {
        return this.table.get(id);
    }

    async create(entity: T): Promise<void> {
        await this.table.add(entity);
        await this.sync(entity, UpdateOperation.CREATE);
    }

    async put(entity: T): Promise<void> {
        await this.table.put(entity);
        await this.sync(entity, UpdateOperation.PUT);
    }

    async bulkCreate(entities: T[]): Promise<void> {
        await this.table.bulkAdd(entities);
        await this.syncServiceProvider
            .getSyncService()
            .createMultiUpdate(entities, UpdateOperation.CREATE, this.entityType);
    }

    async bulkPut(entities: T[]): Promise<void> {
        await this.table.bulkPut(entities);
        await this.syncServiceProvider
            .getSyncService()
            .createMultiUpdate(entities, UpdateOperation.PUT, this.entityType);
    }

    where(index: string | string[]): WhereClause<T, string> {
        // TODO: This is potentially dangerous to expose since the where clause can mutate data as well.
        //  We could potentially wrap this and intercept it
        return this.table.where(index);
    }

    async deleteById(id: string): Promise<void> {
        await this.table.delete(id);
        await this.sync(id, UpdateOperation.DELETE);
    }

    async deleteByIds(ids: string[]): Promise<void> {
        await this.table.bulkDelete(ids);
        await this.syncServiceProvider.getSyncService().createMultiUpdate(ids, UpdateOperation.DELETE, this.entityType);
    }

    async count(): Promise<number> {
        return this.table.count();
    }

    async clear(): Promise<void> {
        await this.table.clear();
        await this.syncServiceProvider.getSyncService().createFullSyncUpdate(this.entityType, []);
    }

    async sync(entity: any, operation: UpdateOperation): Promise<void> {
        await this.syncServiceProvider.getSyncService().createSingleUpdate(entity, operation, this.entityType);
    }

}

export function applyUpdates(existing: any[], updates: PreprocessedEntity[]): any[] {
    // Map entity ID -> update
    let mapping: Map<string, PreprocessedEntity> = new Map();
    // TODO: Should we worry about timestamps here?
    for (let update of updates) {
        let existing = mapping.get(update.id);
        if (existing == null) {
            mapping.set(update.id, update);
        }
    }

    let final: any[] = [];
    for (let entry of existing) {
        let update = mapping.get(entry.id);
        if (update == null) {
            // If there is no update for this entry, just keep it
            final.push(entry);
        } else {
            if (update.operation !== UpdateOperation.DELETE) {
                // If there is an update, and it's not a delete, apply it
                final.push(update.data);
            }

            mapping.delete(entry.id);
        }
    }

    // Any remaining updates are new entities
    for (let update of mapping.values()) {
        if (update.operation !== UpdateOperation.DELETE) {
            final.push(update.data);
        }
    }

    return final;
}

const SYNC_DELAY = 1000;
const PREVIOUS_ENTITY_TYPES = ["entries"];

export type SyncObserver = (entities: PreprocessedEntity[]) => void;

export class SyncService {
    private encryptionService: EncryptionService;
    private migrationService: MigrationService;

    private updateQueueCollection: UpdateQueueCollection;
    private updateQueue: OutgoingUpdate[] = [];

    private readonly transaction: (table: Table<any>, callback: () => Promise<void>) => Promise<void>;
    private readonly tables: Record<string, Table<any>> = {};
    private readonly decryptionErrorCallbacks: Set<(newKey: boolean) => void> = new Set();

    private observers: Map<string, SyncObserver> = new Map();

    private syncTimer: ReturnType<typeof setTimeout> | null = null;

    private remoteService: RemoteService;
    private authService: AuthService;

    constructor(encryptionService: EncryptionService, migrationService: MigrationService,
                updateQueueCollection: UpdateQueueCollection, transaction: (table: Table<any>, callback: () => Promise<void>) => Promise<void>,
                tables: Record<string, Table<any>>, remoteService: RemoteService, authService: AuthService) {
        this.encryptionService = encryptionService;
        this.migrationService = migrationService;
        this.updateQueueCollection = updateQueueCollection;
        this.transaction = transaction;
        this.tables = tables;
        this.remoteService = remoteService;
        this.authService = authService;

        this.authService.addAuthStatusCallback(async (user: AuthenticatedUser | null) => {
            if (user == null) return;
            await this.load();
        });
    }

    private getClient(): KyInstance {
        return this.remoteService.getRemoteClient(RemoteType.SYNC)!;
    }

    async calculateChecksums() {
        let results: Record<string, string> = {};
        for (let [tableName, table] of Object.entries(this.tables)
            .filter(([k, v]) => k != "analyticsSettings" && k != "encryptionKey")) {
            results[tableName] = await calculateChecksum(await table.toArray());
        }

        return {...{all: await calculateChecksum(Object.values(results))}, ...results};
    }

    async load(): Promise<void> {
        if (!(this.remoteService.isRemoteEnabled(RemoteType.SYNC)))
            return;

        this.updateQueue = await this.updateQueueCollection.getAll();
        await this.sync();
    }

    private getUpdatesByEntityId(entityId: string): OutgoingUpdate[] {
        return this.updateQueue.filter(u => u.entityId === entityId
            || u.entities.some(e => e.id == entityId));
    }

    private async removeUpdateByEntityId(outgoingUpdate: OutgoingUpdate) {
        this.updateQueue = this.updateQueue.filter(u => u.id !== outgoingUpdate.id);
        await this.updateQueueCollection.deleteById(outgoingUpdate.id);
    }

    private async removeUpdatesByEntityType(entityType: string): Promise<void> {
        this.updateQueue = this.updateQueue.filter(u => u.entityType !== entityType);
        await this.updateQueueCollection.deleteByEntityType(entityType);
    }

    private isEnabled() {
        return this.remoteService.isRemoteEnabled(RemoteType.SYNC);
    }

    private constructFullUpdateObject(entityType: string, entities: any[]): OutgoingUpdate {
        return {
            entities: entities.map(e => ({
                id: e.id,
                version: this.migrationService.getCurrentDataVersion(),
                data: e,
            })),
            entityId: null,
            entityType,
            id: crypto.randomUUID(),
            operation: UpdateOperation.FULL_SYNC,
            timestamp: Date.now()
        };
    }

    async createFullSyncUpdate(entityType: string, entities: any[]) {
        if (!this.isEnabled()) return;

        await this.removeUpdatesByEntityType(entityType);

        let update: OutgoingUpdate = this.constructFullUpdateObject(entityType, entities);

        this.updateQueue.push(update);
        await this.updateQueueCollection.create(update);
        await this.queueSync();
    }

    async createMultiUpdate(entities: any[], operation: UpdateOperation, entityType: string) {
        if (!this.isEnabled()) return;
        let deleteOperation = operation === UpdateOperation.DELETE;
        let update: OutgoingUpdate = {
            id: crypto.randomUUID(),
            operation,
            entityType,
            entityId: null,
            timestamp: Date.now(),
            entities: entities.map(e => ({
                id: deleteOperation ? e : e.id,
                version: this.migrationService.getCurrentDataVersion(),
                data: deleteOperation ? null : e,
            }))
        };

        this.updateQueue.push(update);
        await this.updateQueueCollection.create(update);
        await this.queueSync();
    }

    async createSingleUpdate(entity: any, operation: UpdateOperation, entityType: string) {
        if (!this.isEnabled()) return;
        let deleteOperation = operation === UpdateOperation.DELETE;
        let entityId = deleteOperation ? entity : entity.id;
        //let existing = this.getUpdatesByEntityId(entity.id);
        let updateEntity: OutgoingUpdateEntity = {
            id: entityId,
            version: this.migrationService.getCurrentDataVersion(),
            data: !deleteOperation ? entity : null,
        }

        let update: OutgoingUpdate = {
            id: crypto.randomUUID(),
            operation,
            entityType,
            entityId: entityId,
            timestamp: Date.now(),
            entities: [
                updateEntity
            ]
        };

        this.updateQueue.push(update);
        await this.updateQueueCollection.create(update);
        //}

        await this.queueSync();
    }

    async sync(): Promise<void> {
        if (!this.authService.isAuthenticated()) return;
        this.syncTimer = null;
        if (!await this.pull()) return;
        await this.push();
    }

    async push(): Promise<string[]> {
        try {
            const response = await this.getClient().post('push', {
                json: {updates: await this.encryptUpdates(this.updateQueue)}
            });

            if (!response.ok) {
                return [];
            }

            const {ack} = await response.json<{ ack: string[] }>();
            await this.removeAcknowledgedUpdates(ack);
            return ack;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    private async verifyKey(key: string | null) {
        if (key == null) {
            this.decryptionErrorCallbacks.forEach(callback => callback(true));
            throw new Error("Encryption key verifier not found");
        }

        await this.decryptEntity(key);
    }

    async pull(): Promise<boolean> {
        try {
            const response = await this.getClient().post('pull');

            if (!response.ok) {
                return false;
            }

            const {key, updates} = await response.json<{ key: string | null, updates: IncomingUpdate[] }>();
            await this.verifyKey(key);
            await this.processUpdates(updates);
            return true;
        } catch (e) {
            console.error(e);
        }

        return false;
    }

    async fullPull(entityTypes?: string[], overwrite: boolean = true): Promise<void> {
        const response = await this.getClient().post('fullPull', {
            json: {entityTypes},
        });

        if (!response.ok) {
            return;
        }

        const data: { entities: Record<string, { id: string, data: string }[]> } = await response.json();
        for (let [entityType, savedEntities] of Object.entries(data.entities)) {
            const table = this.tables[entityType];
            if (table == null) {
                continue;
            }

            if (!overwrite) {
                for (let entity of await table.toArray()) {
                    let matching = savedEntities.find(e => e.id == entity.id);
                    if (matching != null) {
                        let decrypted = await this.decryptEntity(matching.data);
                        let serverCs = await calculateChecksum([decrypted]);
                        let clientCs = await calculateChecksum([entity]);

                        if (serverCs != clientCs) {
                            console.log("Client has mismatching entity", entity, decrypted);
                        } else {
                            savedEntities = savedEntities.filter(e => e.id != entity.id);
                        }
                    } else {
                        console.log("Client has entity that server does not", entity);
                    }
                }

                for (let entity of savedEntities) {
                    let decrypted = await this.decryptEntity(entity.data);
                    console.log("Server has entity that client does not", entityType, decrypted);
                }
            } else {
                await table.clear();

                const entities: any[] = [];
                for (let savedEntity of savedEntities) {
                    let decrypted = await this.decryptEntity(savedEntity.data);
                    entities.push(decrypted);
                }

                await table.bulkPut(entities);
            }
        }
    }

    async fullPush() {
        let updates: OutgoingUpdate[] = [];
        for (let table of SYNCED_ENTITY_TYPES) {
            updates.push(this.constructFullUpdateObject(table, await this.tables[table].toArray()));
        }

        this.updateQueue = updates;
        await this.updateQueueCollection.clear();
        await this.updateQueueCollection.bulkPut(updates);
        await this.push();
    }

    async getSalt(): Promise<string> {
        let stored = localStorage.getItem(SALT_STORAGE_KEY);
        if (stored != null) {
            return stored;
        }

        let salt = await this.fetchSalt();
        localStorage.setItem(SALT_STORAGE_KEY, salt);

        return salt;
    }

    private async fetchSalt() {
        let response = await this.getClient().get('salt');
        if (!response.ok) {
            throw new Error("Failed to get salt");
        }

        return (await response.json<{ salt: string }>()).salt;
    }

    private async decryptEntity(data: string): Promise<any> {
        try {
            return await this.encryptionService.decrypt(data);
        } catch (e) {
            this.decryptionErrorCallbacks.forEach(callback => callback(false));
            throw new Error("Failed to decrypt entity");
        }
    }

    private async preprocessEntity(entity: IncomingUpdateEntity, update: IncomingUpdate, table: Table<any>): Promise<PreprocessedEntity | null> {

        let previous: any = undefined;
        if (PREVIOUS_ENTITY_TYPES.includes(update.entityType) && update.operation != UpdateOperation.CREATE) {
            previous = await table.get(entity.id);
        }

        if (entity.data == null) {
            if (update.operation === UpdateOperation.DELETE) {
                return {
                    id: entity.id,
                    entityType: update.entityType,
                    operation: update.operation,
                    data: null,
                    migrated: false,
                    previous
                };
            }

            return null;
        }

        switch (update.operation) {
            case UpdateOperation.FULL_SYNC:
            case UpdateOperation.PUT:
            case UpdateOperation.CREATE:
                let decrypted = await this.decryptEntity(entity.data);

                let migrated = this.migrationService.isOutdated(entity.version);
                if (migrated) {
                    decrypted = await this.migrationService.migrateSingleEntity(decrypted, update.entityType, entity.version);
                }

                return {
                    id: entity.id,
                    entityType: update.entityType,
                    operation: update.operation,
                    data: decrypted,
                    migrated,
                    previous
                };
        }

        return null;
    }

    private async processEntity(table: Table<any>, entity: PreprocessedEntity): Promise<void> {
        switch (entity.operation) {
            case UpdateOperation.FULL_SYNC:
            case UpdateOperation.PUT:
            case UpdateOperation.CREATE:
                await table.put(entity.data);
                break;
            case UpdateOperation.DELETE:
                await table.delete(entity.id);
                break;
        }
    }

    private async handleConflicts(entity: IncomingUpdateEntity, update: IncomingUpdate): Promise<PreprocessedEntity[]> {
        let preprocessedEntities: PreprocessedEntity[] = [];
        let pendingUpdates = this.getUpdatesByEntityId(entity.id);
        for (let pendingUpdate of pendingUpdates) {
            if (pendingUpdate.entities.length > 0 && pendingUpdate.timestamp > update.timestamp) {
                if (update.operation === UpdateOperation.DELETE) {
                    // Delete overrides any local changes
                    await this.removeUpdateByEntityId(pendingUpdate);
                } else {
                    console.log("Skipping update because local copy is newer", pendingUpdate);
                    for (let entity of pendingUpdate.entities) {
                        // Use local copy as preprocessed entity
                        preprocessedEntities.push({
                            id: entity.id,
                            entityType: update.entityType,
                            operation: update.operation,
                            data: entity.data,
                            migrated: false,
                        })
                    }
                }
            }
        }

        return preprocessedEntities;
    }

    private async processUpdates(updates: IncomingUpdate[]): Promise<void> {

        updates.sort((a, b) => a.timestamp - b.timestamp);
        console.log("Processing updates", updates);

        let acknowledgedUpdates: string[] = [];
        let processedEntities: Map<string, PreprocessedEntity[]> = new Map();
        for (const update of updates) {
            const table = this.tables[update.entityType];
            if (table == null) {
                continue;
            }

            let preprocessedEntities: PreprocessedEntity[] = [];
            for (const entity of update.entities) {
                let conflictUpdatedEntries = await this.handleConflicts(entity, update);
                if (conflictUpdatedEntries.length > 0) {
                    preprocessedEntities.push(...conflictUpdatedEntries);
                    continue;
                }

                let preprocessed = await this.preprocessEntity(entity, update, table);
                if (preprocessed != null) {
                    preprocessedEntities.push(preprocessed);
                } else {
                    console.error("Failed to preprocess entity");
                }
            }

            try {
                await this.transaction(table, async () => {
                    if (update.operation === UpdateOperation.FULL_SYNC) {
                        await table.clear();
                    }

                    for (const entity of preprocessedEntities) {
                        await this.processEntity(table, entity);
                    }
                });

                acknowledgedUpdates.push(update.id);

                let existing = processedEntities.get(update.entityType);
                if (existing == null) {
                    existing = [];
                    processedEntities.set(update.entityType, existing);
                }

                existing.push(...preprocessedEntities);
            } catch (ex) {
                console.error(ex);
            }
        }

        if (acknowledgedUpdates.length > 0) {
            // Acknowledge processed updates
            await this.getClient().post('ack', {
                json: {
                    updates: acknowledgedUpdates
                }
            });
        }

        for (const [entityType, entities] of processedEntities) {
            for (let entity of entities) {
                // Let other clients know about migrated entities
                if (entity.migrated) {
                    await this.createSingleUpdate(entity.data, UpdateOperation.PUT, entity.entityType);
                }
            }

            // Let observers know about the entity updates
            let callback = this.observers.get(entityType);
            if (callback != null) {
                callback(entities);
            }
        }
    }

    async queueSync() {
        if (this.syncTimer != null) {
            clearTimeout(this.syncTimer);
        }

        this.syncTimer = setTimeout(async () => {
            await this.sync();
        }, SYNC_DELAY);
    }

    private async removeAcknowledgedUpdates(ackIds: string[]): Promise<void> {
        this.updateQueue = this.updateQueue.filter(u => !ackIds.includes(u.id));
        await this.updateQueueCollection.deleteByIds(ackIds);
    }

    private async encryptUpdates(updates: OutgoingUpdate[]): Promise<OutgoingUpdateDTO[]> {
        const encryptedUpdates: OutgoingUpdateDTO[] = [];
        for (const update of updates) {
            const entities: OutgoingUpdateEntityDTO[] = [];
            for (const entity of update.entities) {
                entities.push({
                    ...entity,
                    data: entity.data ? await this.encryptionService.encrypt(entity.data) : null
                });
            }

            encryptedUpdates.push({
                ...update,
                entities
            });
        }

        return encryptedUpdates;
    }

    addObserver(entityType: string, observer: SyncObserver) {
        this.observers.set(entityType, observer);
    }

    addDecryptionErrorCallback(callback: (newKey: boolean) => void) {
        this.decryptionErrorCallbacks.add(callback);
    }

    async updateKey() {
        const blob = await this.encryptionService.encrypt({key: crypto.randomUUID()});
        const response = await this.getClient().put('key', {
            json: {key: blob},
        });

        if (!response.ok) {
            return;
        }

        await this.fullPush();
    }
}