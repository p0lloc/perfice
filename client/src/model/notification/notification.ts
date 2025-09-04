import {Weekday} from "@capacitor/local-notifications";

export enum NotificationType {
    REFLECTION = "REFLECTION"
}

export const NOTIFICATION_WEEKDAYS: { name: string, value: number | null }[] = [
    {
        name: "Every day",
        value: null
    },
    {
        name: "Sunday",
        value: Weekday.Sunday
    },
    {
        name: "Monday",
        value: Weekday.Monday
    },
    {
        name: "Tuesday",
        value: Weekday.Tuesday
    },
    {
        name: "Wednesday",
        value: Weekday.Wednesday
    },
    {
        name: "Thursday",
        value: Weekday.Thursday
    },
    {
        name: "Friday",
        value: Weekday.Friday
    },
    {
        name: "Saturday",
        value: Weekday.Saturday
    }
]

export interface StoredNotification {
    id: string;
    type: NotificationType;
    nativeId: number;
    entityId: string;

    title: string;
    body: string;

    hour: number;
    minutes: number;
    weekDay: number | null;
}