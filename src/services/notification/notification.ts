import type {NotificationCollection} from "@perfice/db/collections";
import {NotificationType, type StoredNotification} from "@perfice/model/notification/notification";

export class NotificationService {
    private readonly notificationCollection: NotificationCollection;

    constructor(notificationCollection: NotificationCollection) {
        this.notificationCollection = notificationCollection;
    }

    async getNotificationsByEntityId(entityId: string): Promise<StoredNotification[]> {
        return this.notificationCollection.getNotificationsByEntityId(entityId);
    }

    async createNotification(type: NotificationType, entityId: string, hour: number,
                             minutes: number, weekDay: number | null): Promise<StoredNotification> {

        let entity = {
            id: crypto.randomUUID(),
            type,
            nativeId: 0,
            entityId,
            hour,
            minutes,
            weekDay
        };

        await this.notificationCollection.createNotification(entity);
        return entity;
    }

    async deleteNotificationsByEntityId(entityId: string): Promise<void> {
        return this.notificationCollection.deleteNotificationsByEntityId(entityId);
    }

    async deleteNotificationById(id: string) {
        await this.notificationCollection.deleteNotificationById(id);
    }

    async updateNotification(notification: StoredNotification) {
        // TODO: reschedule notification
        await this.notificationCollection.updateNotification(notification);
    }
}