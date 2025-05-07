import {dateToWeekStart, getDaysDifference, isSameDay} from "@perfice/util/time/simple";
import {WeekStart} from "@perfice/model/variable/time/time";

export const WEEK_DAYS_SHORT = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
];

export const WEEK_DAY_TO_NAME = new Map([
    [0, "Sunday"],
    [1, "Monday"],
    [2, "Tuesday"],
    [3, "Wednesday"],
    [4, "Thursday"],
    [5, "Friday"],
    [6, "Saturday"],
])

export const MONTHS_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export function formatDateYYYYMMDD(date: Date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function formatDayDifference(first: Date, second: Date) {
    let diff = getDaysDifference(first, second);
    return diff == 0 ? "Today" : `${diff}d ago`;
}

export function formatTimestampYYYYMMDD(timestamp: number) {
    return formatDateYYYYMMDD(new Date(timestamp));
}

export function formatDateYYYYMMDDHHMMSS(date: Date) {
    let hour = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    let seconds = date.getSeconds().toString().padStart(2, "0");

    return `${formatDateYYYYMMDD(date)} ${hour}:${minutes}:${seconds}`;
}


function padTime(val: number) {
    return val.toString().padStart(2, "0");
}

export function formatTimestampHHMM(timestamp: number) {
    return formatDateHHMM(new Date(timestamp));
}

export function formatTimeElapsed(minutes: number): string {
    if (minutes < 0) {
        return `-${formatTimeElapsed(-minutes)}`;
    }

    let hours = Math.floor(minutes / 60);
    minutes = Math.floor(minutes % 60);

    if (hours != 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}

export function formatDateHHMM(date: Date) {
    return `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
}

export function formatDateLongTerm(date: Date, currentDate: Date, ws: WeekStart) {
    let weekStart = dateToWeekStart(currentDate, ws); // TODO: don't hardcode week start
    let prefix;
    if (date.getTime() > weekStart.getTime()) {
        return WEEK_DAYS_SHORT[date.getDay()];
    } else {
        return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`
    }
}

export function formatDateLongTermOrHHMM(date: Date, currentDate: Date, ws: WeekStart) {
    if (isSameDay(date, currentDate)) {
        return formatTimestampHHMM(date.getTime());
    }

    return `${formatDateLongTerm(date, currentDate, ws)} ${formatDateHHMM(date)}`;
}
