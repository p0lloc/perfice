import {SimpleTimeScopeType, WeekStart} from "@perfice/model/variable/time/time";

export function dateToMidnight(now: Date) {
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function timestampToMidnight(timestamp: number): number {
    return dateToMidnight(new Date(timestamp)).getTime();
}

export function dateToLastSecondOfDay(now: Date) {
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
}

export function dateWithCurrentTime(date: Date){
    const clone = new Date(date);
    let now = new Date();
    clone.setHours(now.getHours());
    clone.setMinutes(now.getMinutes());

    return clone;
}

export function isSameDay(first: Date, second: Date): boolean {
    return first.getFullYear() == second.getFullYear()
        && first.getMonth() == second.getMonth()
        && first.getDate() == second.getDate();
}

/**
 * Normalizes a week day into one where 0 equals the specified week start.
 * E.g: Monday = 0 and Sunday = 6 if week starts on a monday.
 *
 * @param weekDay JS weekday (sunday = 0)
 * @param weekStart Week start to normalize as.
 */
export function normalizeWeekDayToWeekStart(
    weekDay: number,
    weekStart: WeekStart,
): number {
    switch (weekStart) {
        case WeekStart.MONDAY: // Monday, one day shifted backwards
            return weekDay === 0 ? 6 : weekDay - 1;
        case WeekStart.SATURDAY: // Saturday, one day shifted forwards
            return weekDay === 6 ? 0 : weekDay + 1;
        case WeekStart.SUNDAY: // Default (Sunday)
            return weekDay;
    }
}

export function cloneDateUTC(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
}

export function dateToWeekStart(date: Date, weekStart: WeekStart): Date {
    let clone = cloneDateUTC(date);
    clone.setUTCDate(
        date.getDate() - normalizeWeekDayToWeekStart(date.getDay(), weekStart),
    );
    return clone;
}

export function dateToMonthEnd(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));
}

export function dateToYearEnd(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), 11, 31));
}

export function dateToWeekEnd(date: Date, weekStart: WeekStart): Date {
    let clone = cloneDateUTC(date);
    clone.setUTCDate(
        date.getDate() + (6 - normalizeWeekDayToWeekStart(date.getDay(), weekStart)),
    );
    return clone;
}

export function dateToMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function dateToYearStart(date: Date): Date {
    return new Date(date.getFullYear(), 0, 1);
}

export function addDaysDate(date: Date, days: number): Date {
    let clone = new Date(date);
    clone.setDate(date.getDate() + days);

    return clone;
}

export function getDaysDifference(first: Date, second: Date) {
    return Math.round((dateToMidnight(first).getTime() - dateToMidnight(second).getTime()) / (1000 * 60 * 60 * 24));
}

export function dateToStartOfTimeScope(date: Date, scope: SimpleTimeScopeType, weekStart: WeekStart): Date {
    let result: Date;
    switch (scope) {
        case SimpleTimeScopeType.DAILY: {
            result = date;
            break;
        }
        case SimpleTimeScopeType.WEEKLY: {
            result = dateToWeekStart(date, weekStart);
            break;
        }
        case SimpleTimeScopeType.MONTHLY: {
            result = dateToMonthStart(date);
            break;
        }
        case SimpleTimeScopeType.YEARLY: {
            result = dateToYearStart(date);
            break;
        }
    }

    return dateToMidnight(result);
}


export function dateToEndOfTimeScope(date: Date, scope: SimpleTimeScopeType, weekStart: WeekStart): Date {
    let result: Date;
    switch (scope) {
        case SimpleTimeScopeType.DAILY: {
            result = date;
            break;
        }
        case SimpleTimeScopeType.WEEKLY: {
            result = dateToWeekEnd(date, weekStart);
            break;
        }
        case SimpleTimeScopeType.MONTHLY: {
            result = dateToMonthEnd(date);
            break;
        }
        case SimpleTimeScopeType.YEARLY: {
            result = dateToYearEnd(date);
            break;
        }
    }

    return dateToLastSecondOfDay(result);
}


export function offsetDateByTimeScope(
    timestampToOffset: Date,
    timeScope: SimpleTimeScopeType,
    count: number,
): Date {
    let timestamp = new Date(timestampToOffset);
    switch (timeScope) {
        case SimpleTimeScopeType.DAILY: {
            timestamp.setDate(timestamp.getDate() + count);
            return timestamp;
        }

        case SimpleTimeScopeType.WEEKLY: {
            timestamp.setDate(timestamp.getDate() + 7 * count);
            return timestamp;
        }

        case SimpleTimeScopeType.MONTHLY: {
            return new Date(
                timestamp.getFullYear(),
                timestamp.getMonth() + count,
                timestamp.getDate(),
            );
        }
        case SimpleTimeScopeType.YEARLY: {
            return new Date(
                timestamp.getFullYear() + count,
                timestamp.getMonth(),
                timestamp.getDate(),
            );
        }
    }
}
