import {AggregateType} from "@perfice/services/variable/types/aggregate";
import {faDivide, faPlus} from "@fortawesome/free-solid-svg-icons";
import {TimeScopeType, type TimeScope, SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {formatDateYYYYMMDD, MONTHS_SHORT} from "@perfice/util/time/format";

export const AGGREGATE_TYPES = [
    {
        value: AggregateType.SUM,
        name: "Sum",
        icon: faPlus
    },
    {
        value: AggregateType.MEAN,
        name: "Average",
        icon: faDivide
    }
];

export const TIME_SCOPE_TYPES = [
    {
        value: TimeScopeType.SIMPLE,
        name: "Simple",
    },
    {
        value: TimeScopeType.RANGE,
        name: "Range",
    },
    {
        value: TimeScopeType.FOREVER,
        name: "Since the beginning",
    }
];

export const SIMPLE_TIME_SCOPE_TYPES = [
    {name: "Daily", value: SimpleTimeScopeType.DAILY},
    {name: "Weekly", value: SimpleTimeScopeType.WEEKLY},
    {name: "Monthly", value: SimpleTimeScopeType.MONTHLY},
    {name: "Yearly", value: SimpleTimeScopeType.YEARLY},
];

export function formatCapitalized(str: string) {
    let lowerCase = str.toLowerCase();
    return lowerCase.substring(0, 1).toUpperCase() + lowerCase.substring(1);
}

export function formatDateMonthAndDay(date: Date) {
    return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate().toString().padStart(2, "0")}`;
}

export function formatTimeScopeType(ts: TimeScope) {
    switch (ts.type) {
        case TimeScopeType.SIMPLE:
            return formatCapitalized(ts.value.getType());
        case TimeScopeType.RANGE:
            let value = ts.value;
            let start = value.getStart();
            let end = value.getEnd();
            if (start == null && end == null) return "Forever";

            if (start == null && end != null) return `Until ${formatDateYYYYMMDD(new Date(end))}`;
            if (start != null && end == null) return `Since ${formatDateYYYYMMDD(new Date(start))}`;

            let startDate = new Date(start!);
            let endDate = new Date(end!);
            return `${formatDateMonthAndDay(startDate)} - ${formatDateMonthAndDay(endDate)}`;
        default:
            return formatCapitalized(ts.type);
    }
}
