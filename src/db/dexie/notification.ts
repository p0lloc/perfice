import type {EntityTable} from "dexie";
import type {StoredNotification} from "@perfice/model/notification/notification";
import type {NotificationCollection} from "@perfice/db/collections";

export class DexieNotificationCollection implements NotificationCollection {
    private table: EntityTable<StoredNotification, "id">;

    constructor(table: EntityTable<StoredNotification, "id">) {
        this.table = table;
    }

    async getNotifications(): Promise<StoredNotification[]> {
        return this.table.toArray();
    }

    async getNotificationById(id: string): Promise<StoredNotification | undefined> {
        return this.table.get(id);
    }

    async createNotification(notification: StoredNotification): Promise<void> {
        await this.table.add(notification);
    }

    async updateNotification(notification: StoredNotification): Promise<void> {
        await this.table.put(notification);
    }

    async deleteNotificationById(id: string): Promise<void> {
        await this.table.delete(id);
    }

    async getNotificationsByEntityId(entityId: string): Promise<StoredNotification[]> {
        return this.table.where("entityId").equals(entityId).toArray();
    }

    async deleteNotificationsByEntityId(entityId: string): Promise<void> {
        await this.table.where("entityId").equals(entityId).delete();
    }
}