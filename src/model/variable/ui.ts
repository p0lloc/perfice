import {AggregateType} from "@perfice/services/variable/types/aggregate";
import {
    faDiceOne,
    faDivide,
    faEquals,
    faGreaterThan,
    faGreaterThanEqual, faLessThan, faLessThanEqual, faList,
    faMinus,
    faNotEqual,
    faPlus, faTimes
} from "@fortawesome/free-solid-svg-icons";
import {TimeScopeType, type TimeScope, SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {formatDateYYYYMMDD, formatTimestampYYYYMMDD, MONTHS_SHORT, WEEK_DAYS_SHORT} from "@perfice/util/time/format";
import {CalculationOperator} from "@perfice/services/variable/types/calculation";
import {FilterComparisonOperator} from "@perfice/services/variable/filtering";
import {getWeekNumber} from "@perfice/util/time/simple";

export const AGGREGATE_TYPES = [
    {
        value: AggregateType.COUNT,
        name: "Count",
        icon: faDiceOne
    },
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

export const TIME_SCOPE_UNITS = {
    [SimpleTimeScopeType.DAILY]: "days",
    [SimpleTimeScopeType.WEEKLY]: "weeks",
    [SimpleTimeScopeType.MONTHLY]: "months",
    [SimpleTimeScopeType.YEARLY]: "years",
};

export const TIME_SCOPE_LABELS = {
    [SimpleTimeScopeType.DAILY]: "Today",
    [SimpleTimeScopeType.WEEKLY]: "This week",
    [SimpleTimeScopeType.MONTHLY]: "This month",
    [SimpleTimeScopeType.YEARLY]: "This year",
};

export function formatSimpleTimestamp(timestamp: number, timeScope: SimpleTimeScopeType, useWeekDay: boolean = false): string {
    switch (timeScope) {
        case SimpleTimeScopeType.DAILY:
            return useWeekDay ? WEEK_DAYS_SHORT[new Date(timestamp).getDay()] : formatTimestampYYYYMMDD(timestamp);
        case SimpleTimeScopeType.WEEKLY:
            return `W${getWeekNumber(new Date(timestamp))}`;
        case SimpleTimeScopeType.MONTHLY:
            return MONTHS_SHORT[new Date(timestamp).getMonth()];
        default:
            return "";
    }
}

export function formatCapitalized(str: string) {
    let lowerCase = str.toLowerCase();
    return lowerCase.substring(0, 1).toUpperCase() + lowerCase.substring(1);
}

export function formatDateMonthAndDay(date: Date) {
    return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate().toString().padStart(2, "0")}`;
}


export const FILTER_COMPARISON_OPERATORS = [
    {name: "", value: FilterComparisonOperator.EQUAL, icon: faEquals},
    {name: "", value: FilterComparisonOperator.NOT_EQUAL, icon: faNotEqual},
    {name: "", value: FilterComparisonOperator.GREATER_THAN, icon: faGreaterThan},
    {name: "", value: FilterComparisonOperator.GREATER_THAN_EQUAL, icon: faGreaterThanEqual},
    {name: "", value: FilterComparisonOperator.LESS_THAN, icon: faLessThan},
    {name: "", value: FilterComparisonOperator.LESS_THAN_EQUAL, icon: faLessThanEqual},
    {name: "", value: FilterComparisonOperator.IN, icon: faList},
    {name: "", value: FilterComparisonOperator.NOT_IN, icon: faTimes},
];

export const CALCULATION_OPERATORS = [
    {name: "Plus", value: CalculationOperator.PLUS, icon: faPlus},
    {name: "Minus", value: CalculationOperator.MINUS, icon: faMinus},
    {name: "Multiply", value: CalculationOperator.MULTIPLY, icon: faTimes},
    {name: "Divide", value: CalculationOperator.DIVIDE, icon: faDivide},
];

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
