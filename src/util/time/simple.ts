import {SimpleTimeScopeType, WeekStart} from "@perfice/model/variable/time/time";

export function dateToMidnight(now: Date) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function dateToLastSecondOfDay(now: Date) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
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

export function dateToWeekStart(date: Date, weekStart: WeekStart): Date {
    let clone = new Date(date);
    clone.setDate(
        date.getDate() - normalizeWeekDayToWeekStart(date.getDay(), weekStart),
    );
    return clone;
}

export function dateToMonthEnd(date: Date): Date {
    return new Date(date.getFullYear(), date.getUTCMonth() + 1, 0);
}

export function dateToYearEnd(date: Date): Date {
    return new Date(date.getFullYear(), 11, 31);
}

export function dateToWeekEnd(date: Date, weekStart: WeekStart): Date {
    let clone = new Date(date);
    clone.setDate(
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
