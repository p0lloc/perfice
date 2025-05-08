import {SimpleTimeScope, SimpleTimeScopeType, WeekStart} from "@perfice/model/variable/time/time";

export function dateToMidnight(now: Date) {
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function timestampToMidnight(timestamp: number): number {
    return dateToMidnight(new Date(timestamp)).getTime();
}

export function dateToLastSecondOfDay(now: Date) {
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
}

export function dateWithCurrentTime(date: Date) {
    const clone = new Date(date);
    let now = new Date();
    clone.setHours(now.getHours());
    clone.setMinutes(now.getMinutes());

    return clone;
}

export function getWeekNumber(date: Date): number {
    let target = new Date(date);
    let dayNr = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    let firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() != 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
}

export function localHhMmToUtc(hours: number, minutes: number): [number, number] {
    let date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return [date.getUTCHours(), date.getUTCMinutes()];
}

export function utcHhMmToLocal(hours: number, minutes: number): [number, number] {
    let current = new Date();
    let date = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), hours, minutes));
    return [date.getHours(), date.getMinutes()];
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
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - normalizeWeekDayToWeekStart(date.getDay(), weekStart),
        date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
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

export function offsetSimpleTimeScope(timeScope: SimpleTimeScope, count: number): SimpleTimeScope {
    let newDate = offsetDateByTimeScope(new Date(timeScope.getTimestamp()), timeScope.getType(), count);
    return new SimpleTimeScope(timeScope.getType(), timeScope.getWeekStart(), newDate.getTime());
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

export function parseHhMm(value: string): [number, number] | null {
    let parts = value.split(":");
    if (parts.length != 2) return null;

    let hours = parseInt(parts[0]);
    let minutes = parseInt(parts[1]);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0) return null;

    return [hours, minutes];
}

export function parseHhMmElapsedMinutes(value: string): number | null {
    let result = parseHhMm(value);
    if (result == null) return null;

    let [hours, minutes] = result;
    return hours * 60 + minutes;
}

export function parseHhMmTimeOfDayMinutes(value: string): number | null {
    let result = parseHhMm(value);
    if (result == null) return null;

    let [hours, minutes] = result;
    if (hours < 0 || minutes < 0 || hours > 23 || minutes > 59) return null;

    return hours * 60 + minutes;
}
