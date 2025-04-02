import {dateToEndOfTimeScope, dateToStartOfTimeScope} from "@perfice/util/time/simple";

export type TimeRange = {
    type: TimeRangeType.ALL,
} | {
    type: TimeRangeType.BETWEEN,
    lower: number
    upper: number,
} | {
    type: TimeRangeType.AFTER,
    lower: number,
} | {
    type: TimeRangeType.BEFORE,
    upper: number
} | {
    type: TimeRangeType.LIST,
    list: number[]
};

// Represents the weekday that is considered the start of week
export enum WeekStart {
    SUNDAY = 0,
    MONDAY = 1,
    SATURDAY = -1,
}

export function isTimestampInRange(timestamp: number, range: TimeRange) {
    switch (range.type) {
        case TimeRangeType.ALL:
            return true;
        case TimeRangeType.BETWEEN:
            return timestamp >= range.lower && timestamp <= range.upper;
        case TimeRangeType.BEFORE:
            return timestamp <= range.upper;
        case TimeRangeType.AFTER:
            return timestamp >= range.lower;
        case TimeRangeType.LIST:
            return range.list.includes(timestamp);
    }
}

export enum TimeScopeType {
    SIMPLE = "SIMPLE",
    RANGE = "RANGE",
    FOREVER = "FOREVER",
}

export type TimeScope =
    TS<TimeScopeType.SIMPLE, SimpleTimeScope>
    | TS<TimeScopeType.RANGE, RangeTimeScope>
    | TS<TimeScopeType.FOREVER, ForeverTimeScope>;

export class RangeTimeScope implements TimeScopeDefinition {
    private readonly start: number | null;
    private readonly end: number | null;

    constructor(start: number | null, end: number | null) {
        this.start = start;
        this.end = end;
    }

    convertToRange(): TimeRange {
        let start = this.start;
        let end = this.end;

        if (start != null && end != null) {
            return {type: TimeRangeType.BETWEEN, upper: end, lower: start};
        }

        if (start != null && end == null) {
            return {type: TimeRangeType.AFTER, lower: start};
        }

        if (start == null && end != null) {
            return {type: TimeRangeType.BEFORE, upper: end};
        }

        // If both of them are null for some reason, return an open range
        return {type: TimeRangeType.ALL};
    }

    getStart(): number | null {
        return this.start;
    }

    getEnd(): number | null {
        return this.end;
    }
}

export function timeRangeToRangedTimeScope(range: TimeRange): RangeTimeScope {
    switch (range.type) {
        case TimeRangeType.ALL:
            return new RangeTimeScope(null, null);
        case TimeRangeType.BETWEEN:
            return new RangeTimeScope(range.lower, range.upper);
        case TimeRangeType.AFTER:
            return new RangeTimeScope(range.lower, null);
        case TimeRangeType.BEFORE:
            return new RangeTimeScope(null, range.upper);
        case TimeRangeType.LIST:
            throw new Error("Not implemented");
    }
}

export class ForeverTimeScope implements TimeScopeDefinition {
    convertToRange(): TimeRange {
        return {type: TimeRangeType.ALL};
    }
}


export interface TS<T extends TimeScopeType, V extends TimeScopeDefinition> {
    type: T;
    value: V;
}

export interface TimeScopeDefinition {
    convertToRange(): TimeRange;
}

export enum SimpleTimeScopeType {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}

export class SimpleTimeScope implements TimeScopeDefinition {
    private readonly type: SimpleTimeScopeType;
    private readonly weekStart: WeekStart;
    private readonly timestamp: number;

    constructor(type: SimpleTimeScopeType, weekStart: WeekStart, timestamp: number) {
        this.type = type;
        this.weekStart = weekStart;
        this.timestamp = dateToStartOfTimeScope(new Date(timestamp), type, weekStart).getTime();
    }

    convertToRange(): TimeRange {
        let end = dateToEndOfTimeScope(new Date(this.timestamp), this.type, this.weekStart).getTime();
        let start = dateToStartOfTimeScope(new Date(this.timestamp), this.type, this.weekStart).getTime();
        return {type: TimeRangeType.BETWEEN, upper: end, lower: start};
    }

    getType(): SimpleTimeScopeType {
        return this.type;
    }

    getTimestamp(): number {
        return this.timestamp;
    }

    getWeekStart(): WeekStart {
        return this.weekStart;
    }
}

export function tSimple(type: SimpleTimeScopeType, weekStart: WeekStart, timestamp: number): TimeScope {
    return {type: TimeScopeType.SIMPLE, value: new SimpleTimeScope(type, weekStart, timestamp)};
}

export function tRange(start: number | null, end: number | null): TimeScope {
    return {type: TimeScopeType.RANGE, value: new RangeTimeScope(start, end)};
}

export function tForever(): TimeScope {
    return {type: TimeScopeType.FOREVER, value: new ForeverTimeScope()};
}


export enum TimeRangeType {
    ALL,
    BETWEEN,
    BEFORE,
    AFTER,
    LIST
}
