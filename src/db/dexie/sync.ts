import type {OutgoingUpdate} from "@perfice/model/sync/sync";
import type {EntityTable} from "dexie";
import type {UpdateQueueCollection} from "@perfice/db/collections";

export class DexieUpdateQueueCollection implements UpdateQueueCollection {

    private table: EntityTable<OutgoingUpdate, 'id'>;

    constructor(table: EntityTable<OutgoingUpdate, 'id'>) {
        this.table = table;
    }


    async getAll(): Promise<OutgoingUpdate[]> {
        return this.table.toArray();
    }

    async create(update: OutgoingUpdate): Promise<void> {
        await this.table.add(update);
    }

    async update(update: OutgoingUpdate): Promise<void> {
        await this.table.put(update);
    }

    async getByEntityId(entityId: string): Promise<OutgoingUpdate | undefined> {
        return this.table.where("entityId").equals(entityId).first();
    }

    async deleteByEntityType(entityType: string): Promise<void> {
        await this.table.where("entityType").equals(entityType).delete();
    }

    async deleteByIds(ids: string[]): Promise<void> {
        await this.table.bulkDelete(ids);
    }

    async deleteById(id: string): Promise<void> {
        await this.table.delete(id);
    }

    async bulkPut(updates: OutgoingUpdate[]): Promise<void> {
        await this.table.bulkPut(updates);
    }

    clear(): Promise<void> {
        return this.table.clear();
    }

}
