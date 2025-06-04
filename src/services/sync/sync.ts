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
import ky, {type KyInstance} from "ky";

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
        await this.sync(entity, UpdateOperation.PUT);
    }

    async put(entity: T): Promise<void> {
        await this.table.put(entity);
        await this.sync(entity, UpdateOperation.PUT);
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

export type SyncObserver = (entities: PreprocessedEntity[]) => void;

export class SyncService {
    private encryptionService: EncryptionService;
    private migrationService: MigrationService;

    private updateQueueCollection: UpdateQueueCollection;
    private updateQueue: OutgoingUpdate[] = [];

    private transaction: (table: Table<any>, callback: () => Promise<void>) => Promise<void>;
    private readonly tables: Record<string, Table<any>> = {};

    private observers: Map<string, SyncObserver> = new Map();

    private syncTimer: ReturnType<typeof setTimeout> | null = null;
    private client: KyInstance;

    constructor(encryptionService: EncryptionService, migrationService: MigrationService,
                updateQueueCollection: UpdateQueueCollection, transaction: (table: Table<any>, callback: () => Promise<void>) => Promise<void>,
                tables: Record<string, Table<any>>) {
        this.encryptionService = encryptionService;
        this.migrationService = migrationService;
        this.updateQueueCollection = updateQueueCollection;
        this.transaction = transaction;
        this.tables = tables;
        this.client = ky.extend({
            prefixUrl: `${import.meta.env.VITE_BACKEND_URL}/api/sync`,
            timeout: 50000,
            retry: 0,
            credentials: "include"
        });
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

    async createFullSyncUpdate(entityType: string, entities: any[]) {
        await this.removeUpdatesByEntityType(entityType);

        let update: OutgoingUpdate = {
            id: crypto.randomUUID(),
            operation: UpdateOperation.FULL_SYNC,
            entityType,
            entityId: null,
            timestamp: Date.now(),
            entities: entities.map(e => ({
                id: e.id,
                version: this.migrationService.getCurrentDataVersion(),
                data: e,
            }))
        };

        this.updateQueue.push(update);
        await this.updateQueueCollection.create(update);
        await this.queueSync();
    }

    async createMultiUpdate(entities: any[], operation: UpdateOperation, entityType: string) {
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
        let deleteOperation = operation === UpdateOperation.DELETE;
        let entityId = deleteOperation ? entity : entity.id;
        //let existing = this.getUpdatesByEntityId(entity.id);
        let updateEntity: OutgoingUpdateEntity = {
            id: entityId,
            version: this.migrationService.getCurrentDataVersion(),
            data: !deleteOperation ? entity : null,
        }

        /*existing.sort((a, b) => a.timestamp - b.timestamp);
        if (existing.length > 0) {
            // Updates still need to be in the same order, it could be problematic if they were assigned the same timestamp
            let start = Date.now() - existing.length;
            // Update all existing updates to use the new entity
            for (let i = 0; i < existing.length; i++) {
                let existingUpdate = existing[i];
                if (existingUpdate.operation == UpdateOperation.DELETE && operation != UpdateOperation.DELETE) {
                    // Any deleted entity should stay deleted
                    continue;
                }

                existingUpdate.operation = operation;
                existingUpdate.timestamp = start + i;
                existingUpdate.entities = existingUpdate.entities.map(e => e.id == entity.id ? updateEntity : e);

                await this.updateQueueCollection.update(existingUpdate);
            }
        } else {*/
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

    async sync() {
        this.syncTimer = null;
        await this.pull();
        await this.push();
    }

    async push(): Promise<string[]> {
        const response = await this.client.post('push', {
            json: {updates: await this.encryptUpdates(this.updateQueue)}
        });

        if (!response.ok) {
            throw new Error('Failed to push updates');
        }

        const {ack} = await response.json<{ ack: string[] }>();
        await this.removeAcknowledgedUpdates(ack);
        return ack;
    }

    async pull(): Promise<void> {
        const response = await this.client.post('pull');

        if (!response.ok) {
            throw new Error('Failed to pull updates');
        }

        const {updates} = await response.json<{ updates: IncomingUpdate[] }>();
        await this.processUpdates(updates);
    }

    async fullPull(entityTypes?: string[], overwrite: boolean = true): Promise<void> {
        const response = await this.client.post('fullPull', {
            json: {entityTypes},
        });

        if (!response.ok) {
            throw new Error('Failed to pull updates');
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
                        let decrypted = await this.encryptionService.decrypt(matching.data);
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
                    let decrypted = await this.encryptionService.decrypt(entity.data);
                    console.log("Server has entity that client does not", entityType, decrypted);
                }
            } else {
                await table.clear();

                const entities: any[] = [];
                for (let savedEntity of savedEntities) {
                    let decrypted = await this.encryptionService.decrypt(savedEntity.data);
                    entities.push(decrypted);
                }

                await table.bulkPut(entities);
            }
        }
    }

    async fullPush() {
        const all = [
            "trackables",
            "variables",
            "entries",
            "trackableCategories",
            "forms",
            "formSnapshots",
            "indices",
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
        ];

        for (let table of all) {
            await this.createFullSyncUpdate(table, await this.tables[table].toArray());
        }
    }

    private async preprocessEntity(entity: IncomingUpdateEntity, update: IncomingUpdate, table: Table<any>): Promise<PreprocessedEntity | null> {
        if (entity.data == null) {
            if (update.operation === UpdateOperation.DELETE) {
                return {
                    id: entity.id,
                    entityType: update.entityType,
                    operation: update.operation,
                    data: null,
                    migrated: false,
                };
            }

            return null;
        }

        switch (update.operation) {
            case UpdateOperation.FULL_SYNC:
            case UpdateOperation.PUT:
                let decrypted = await this.encryptionService.decrypt(entity.data);

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
                };
        }

        return null;
    }

    private async processEntity(table: Table<any>, entity: PreprocessedEntity): Promise<void> {
        switch (entity.operation) {
            case UpdateOperation.FULL_SYNC:
            case UpdateOperation.PUT:
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

        if (acknowledgedUpdates.length > 0) {
            // Acknowledge processed updates
            await this.client.post('ack', {
                json: {
                    updates: acknowledgedUpdates
                }
            });
        }
    }

    private async queueSync() {
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

}

// export let migrationService: MigrationService;
// export let encryptionService: EncryptionService;
// export let syncService: SyncService;
// export let journalEntryTable: SyncedTable<JournalEntry, string>;
//
// let resolver: (() => void) = () => {
// };
//
// export const resole = new Promise<void>(resolve => {
//     resolver = resolve;
// });
//
// (async () => {
//     migrationService = new MigrationService();
//     encryptionService = new EncryptionService(new AuthKeyCollection(db.auth_key));
//     await encryptionService.load();
//     const tables: Record<string, Table<any>> = {
//         journal_entries: db.journal_entries
//     };
//
//     syncService = new SyncService(encryptionService,
//         migrationService, new UpdateQueueCollection(db.update_queue), db, tables);
//     journalEntryTable = new SyncedTable(db.journal_entries, syncService, 'journal_entries');
//     resolver?.();
// })();
