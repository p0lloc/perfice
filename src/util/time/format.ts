import {isSameDay} from "@perfice/util/time/simple";

export const WEEK_DAYS_SHORT = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
];


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

export function formatDateHHMM(date: Date) {
    return `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
}

export function formatDateLongTerm(date: Date) {
    return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateLongTermOrHHMM(date: Date, currentDate: Date) {
    if(isSameDay(date, currentDate)) {
        return formatTimestampHHMM(date.getTime());
    }

    return `${formatDateLongTerm(date)} ${formatDateHHMM(date)}`;
}
