import type {StoredNotification} from "@perfice/model/notification/notification";
import {LocalNotifications, type PendingLocalNotificationSchema, type ScheduleOn} from "@capacitor/local-notifications";
import {deleteIdentifiedInArray} from "@perfice/util/array";
import type {NotificationScheduler} from "@perfice/services/notification/notification";
import {utcHhMmToLocal} from "@perfice/util/time/simple";

export class NativeNotificationScheduler implements NotificationScheduler {

    async scheduleStoredNotifications(stored: StoredNotification[]) {

        let pending = (await LocalNotifications.getPending()).notifications;
        for (let notification of stored) {
            let nativeNotification = pending
                .find(n => n.id == notification.nativeId);

            pending = deleteIdentifiedInArray(pending, notification.nativeId);

            if (nativeNotification != null) {
                if (!this.doesNotificationMatch(notification, nativeNotification)) {
                    // Notification does not match, cancel it
                    await this.unscheduleNotification(nativeNotification.id);
                } else {
                    // Scheduled notification matches, no need to schedule it again
                    continue;
                }
            }

            await this.scheduleNotification(notification);
        }

        for (let remaining of pending) {
            // This notification does not exist in the database, cancel it
            await this.unscheduleNotification(remaining.id);
        }
    }

    async scheduleNotification(notification: StoredNotification) {
        let on = this.createScheduleForNotification(notification);
        let result = await LocalNotifications.requestPermissions();
        if(result.display != "granted") return;

        await LocalNotifications.schedule({
            notifications: [
                {
                    id: notification.nativeId,
                    title: notification.title,
                    extra: notification.entityId,
                    body: notification.body,
                    schedule: {
                        on: on
                    }
                }
            ]
        });
    }

    async unscheduleNotification(nativeId: number) {
        await LocalNotifications.cancel({
            notifications: [{
                id: nativeId
            }]
        });
    }

    private createScheduleForNotification(notification: StoredNotification): ScheduleOn {
        let [localHour, localMinutes] = utcHhMmToLocal(notification.hour, notification.minutes);
        return {
            hour: localHour,
            minute: localMinutes,
            weekday: notification.weekDay ?? undefined
        }
    }

    private scheduleMatches(notification: StoredNotification, nativeNotification: PendingLocalNotificationSchema) {
        let shouldBe = this.createScheduleForNotification(notification);
        return nativeNotification.schedule?.on?.hour == shouldBe.hour &&
            nativeNotification.schedule?.on?.minute == shouldBe.minute &&
            nativeNotification.schedule?.on?.weekday == shouldBe.weekday;
    }

    private titleAndBodyMatch(notification: StoredNotification, nativeNotification: PendingLocalNotificationSchema) {
        return notification.title == nativeNotification.title &&
            notification.body == nativeNotification.body;
    }

    private doesNotificationMatch(notification: StoredNotification, nativeNotification: PendingLocalNotificationSchema) {
        return notification.nativeId == nativeNotification.id
            && this.scheduleMatches(notification, nativeNotification)
            && this.titleAndBodyMatch(notification, nativeNotification);
    }

}