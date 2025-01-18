import {ForeverTimeScope, type TimeScope, type TimeScopeDefinition, type WeekStart} from "./time";
import {TimeScopeType, SimpleTimeScopeType, SimpleTimeScope, RangeTimeScope} from "./time";

// Time scopes follow the format <type>|<data> where <data> is specific to the type
const TIME_SCOPE_DATA_DELIM = ":";
const TIME_SCOPE_TYPE_DELIM = "|";

export const TIME_SCOPE_SERIALIZERS: Record<TimeScopeType, (data: TimeScopeDefinition) => string> = {
    [TimeScopeType.SIMPLE]: (data: TimeScopeDefinition) => {
        let simpleData = data as SimpleTimeScope;
        return `${simpleData.getType()}${TIME_SCOPE_DATA_DELIM}${simpleData.getTimestamp()}`;
    },
    [TimeScopeType.RANGE]: (data: TimeScopeDefinition) => {
        let rangeData = data as RangeTimeScope;
        return `${rangeData.getStart() ?? ""}${TIME_SCOPE_DATA_DELIM}${rangeData.getEnd() ?? ""}`;
    },
    [TimeScopeType.FOREVER]: () => {
        return "";
    }
};

export const TIME_SCOPE_DESERIALIZERS: Record<TimeScopeType, (data: string, weekStart: WeekStart) => TimeScopeDefinition> = {
    [TimeScopeType.SIMPLE]: (data: string, weekStart: WeekStart) => {

        let parts = data.split(TIME_SCOPE_DATA_DELIM);
        if (parts.length != 2) {
            throw new Error("Invalid simple time scope");
        }

        let simpleTypeStr: string = parts[0];
        let timestamp: number = parseInt(parts[1]);

        let simpleType: SimpleTimeScopeType;
        switch (simpleTypeStr) {
            case "DAILY": {
                simpleType = SimpleTimeScopeType.DAILY;
                break;
            }
            case "WEEKLY": {
                simpleType = SimpleTimeScopeType.WEEKLY;
                break;
            }
            case "MONTHLY": {
                simpleType = SimpleTimeScopeType.MONTHLY;
                break;
            }
            case "YEARLY": {
                simpleType = SimpleTimeScopeType.YEARLY;
                break;
            }
            default:
                throw new Error("Invalid simple time scope");
        }

        return new SimpleTimeScope(simpleType, weekStart, timestamp);
    },
    [TimeScopeType.RANGE]: (data: string) => {
        let parts = data.split(TIME_SCOPE_DATA_DELIM);
        if (parts.length != 2) {
            throw new Error("Invalid simple time scope");
        }

        let start = parseRangeTimestamp(parts[0]);
        let end = parseRangeTimestamp(parts[1]);

        return new RangeTimeScope(start, end);
    },
    [TimeScopeType.FOREVER]: () => {
        return new ForeverTimeScope();
    }
};

function parseRangeTimestamp(data: string): number | null {
    if (data === "") {
        return null;
    }

    return parseInt(data);
}


export function deserializeTimeScope(s: string, weekStart: WeekStart): TimeScope {
    let parts = s.split(TIME_SCOPE_TYPE_DELIM);
    if (parts.length != 2) {
        throw new Error("Invalid time scope!");
    }

    let typeName: TimeScopeType = parts[0] as TimeScopeType;
    let deserializer = TIME_SCOPE_DESERIALIZERS[typeName];
    if (deserializer === undefined) {
        throw new Error("Invalid time scope type!");
    }

    return {type: typeName, value: deserializer(parts[1], weekStart)} as TimeScope;
}

export function serializeTimeScope(s: TimeScope) {
    let serializer = TIME_SCOPE_SERIALIZERS[s.type];
    if (serializer === undefined) {
        throw new Error("Invalid time scope type!");
    }

    return `${s.type.toString()}${TIME_SCOPE_TYPE_DELIM}${serializer(s.value)}`;
}
