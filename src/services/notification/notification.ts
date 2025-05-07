import type {NotificationCollection} from "@perfice/db/collections";
import {NotificationType, type StoredNotification} from "@perfice/model/notification/notification";
import {Capacitor} from "@capacitor/core";
import {NativeNotificationScheduler} from "@perfice/services/notification/native";
import {WebNotificationScheduler} from "@perfice/services/notification/web";

export interface NotificationScheduler {
    scheduleStoredNotifications(notifications: StoredNotification[]): Promise<void>;

    scheduleNotification(notification: StoredNotification): Promise<void>;

    unscheduleNotification(nativeId: number): Promise<void>;
}

export type NotificationClickedCallback = (entityId: string) => Promise<void>;

export class NotificationService {

    private readonly notificationCollection: NotificationCollection;
    private readonly scheduler: NotificationScheduler;

    private readonly listeners: Map<NotificationType, NotificationClickedCallback> = new Map();

    constructor(notificationCollection: NotificationCollection) {
        this.notificationCollection = notificationCollection;
        this.scheduler = Capacitor.isNativePlatform() ? new NativeNotificationScheduler() : new WebNotificationScheduler();
    }

    addNotificationClickedListener(type: NotificationType, callback: NotificationClickedCallback) {
        this.listeners.set(type, callback);
    }

    async getNotificationsByEntityId(entityId: string): Promise<StoredNotification[]> {
        return this.notificationCollection.getNotificationsByEntityId(entityId);
    }

    async scheduleStoredNotifications() {
        let stored = await this.notificationCollection.getNotifications();
        await this.scheduler.scheduleStoredNotifications(stored);
    }

    async onNotificationClicked(entityId: string) {
        let notifications = await this.notificationCollection.getNotificationsByEntityId(entityId);
        if (notifications == null) return;

        for (let notification of notifications) {
            let callback = this.listeners.get(notification.type);
            if (callback == null) continue;

            await callback(notification.entityId);
        }
    }

    async createNotification(type: NotificationType, entityId: string, title: string, body: string,
                             hour: number, minutes: number, weekDay: number | null): Promise<StoredNotification> {

        let entity: StoredNotification = {
            id: crypto.randomUUID(),
            type,
            nativeId: 0,
            entityId,
            title,
            body,
            hour,
            minutes,
            weekDay
        };

        await this.notificationCollection.createNotification(entity);
        await this.scheduler.scheduleNotification(entity);
        return entity;
    }

    async deleteNotificationsByEntityId(entityId: string): Promise<void> {
        let notifications = await this.notificationCollection.getNotificationsByEntityId(entityId);
        if (notifications == null) return;

        // Unschedule all notifications
        for (let notification of notifications) {
            await this.scheduler.unscheduleNotification(notification.nativeId);
        }

        await this.notificationCollection.deleteNotificationsByEntityId(entityId);
    }

    async deleteNotificationById(id: string) {
        let notification = await this.notificationCollection.getNotificationById(id);
        if (notification == null) return;

        await this.notificationCollection.deleteNotificationById(id);
        await this.scheduler.unscheduleNotification(notification.nativeId);
    }

    async updateNotification(notification: StoredNotification) {
        // Reschedule notification
        await this.scheduler.unscheduleNotification(notification.nativeId);
        await this.scheduler.scheduleNotification(notification);

        await this.notificationCollection.updateNotification(notification);
    }
}
