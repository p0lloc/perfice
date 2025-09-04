import type {StoredNotification} from "@perfice/model/notification/notification";
import type {NotificationCollection} from "@perfice/db/collections";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieNotificationCollection implements NotificationCollection {
    private table: SyncedTable<StoredNotification>;

    constructor(table: SyncedTable<StoredNotification>) {
        this.table = table;
    }

    async getNotifications(): Promise<StoredNotification[]> {
        return this.table.getAll();
    }

    async getNotificationById(id: string): Promise<StoredNotification | undefined> {
        return this.table.getById(id);
    }

    async createNotification(notification: StoredNotification): Promise<void> {
        await this.table.create(notification);
    }

    async updateNotification(notification: StoredNotification): Promise<void> {
        await this.table.put(notification);
    }

    async deleteNotificationById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }

    async getNotificationsByEntityId(entityId: string): Promise<StoredNotification[]> {
        return this.table.where("entityId").equals(entityId).toArray();
    }

    async deleteNotificationsByEntityId(entityId: string): Promise<void> {
        let byEntity = await this.table.where("entityId").equals(entityId).toArray();
        await this.table.deleteByIds(byEntity.map(n => n.id));
    }
}