import type {NotificationScheduler} from "@perfice/services/notification/notification";
import type {StoredNotification} from "@perfice/model/notification/notification";

export class WebNotificationScheduler implements NotificationScheduler {

    async scheduleStoredNotifications(stored: StoredNotification[]) {

    }

    async scheduleNotification(notification: StoredNotification) {

    }

    async unscheduleNotification(nativeId: number) {

    }
}