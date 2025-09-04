import type {JournalEntry} from "@perfice/model/journal/journal";
import {extractValueFromDisplay} from "./types/list";
import {
    comparePrimitivesLoosely,
    primitiveAsNumber,
    type PrimitiveValue,
    PrimitiveValueType
} from "@perfice/model/primitive/primitive";


export enum FilterComparisonOperator {
    EQUAL = "EQUAL",
    NOT_EQUAL = "NOT_EQUAL",
    GREATER_THAN = "GREATER_THAN",
    GREATER_THAN_EQUAL = "GREATER_THAN_EQUAL",
    LESS_THAN = "LESS_THAN",
    LESS_THAN_EQUAL = "LESS_THAN_EQUAL",
    IN = "IN",
    NOT_IN = "NOT_IN",
}

export type NumberFilterComparisonOperator =
    FilterComparisonOperator.GREATER_THAN |
    FilterComparisonOperator.GREATER_THAN_EQUAL |
    FilterComparisonOperator.LESS_THAN |
    FilterComparisonOperator.LESS_THAN_EQUAL;

export interface JournalEntryFilter {
    id: string;
    field: string;
    operator: FilterComparisonOperator;
    value: PrimitiveValue;
}

export function isInList(value: PrimitiveValue, filter: JournalEntryFilter): boolean {
    if (filter.value.type != PrimitiveValueType.LIST) return false;

    return filter.value.value.some(v => comparePrimitivesLoosely(value, v));
}

export function isFilterMet(value: PrimitiveValue, filter: JournalEntryFilter): boolean {
    switch (filter.operator) {
        case FilterComparisonOperator.EQUAL:
        case FilterComparisonOperator.NOT_EQUAL:
            let comparison = comparePrimitivesLoosely(value, filter.value);
            return (filter.operator == FilterComparisonOperator.EQUAL) ? comparison : !comparison;
        case FilterComparisonOperator.GREATER_THAN:
        case FilterComparisonOperator.GREATER_THAN_EQUAL:
        case FilterComparisonOperator.LESS_THAN:
        case FilterComparisonOperator.LESS_THAN_EQUAL:
            return isNumberFilterMet(value, filter, filter.operator);
        case FilterComparisonOperator.IN:
            return isInList(value, filter);
        case FilterComparisonOperator.NOT_IN:
            return !isInList(value, filter);
    }
}

export function isNumberFilterMet(first: PrimitiveValue, filter: JournalEntryFilter, operator: NumberFilterComparisonOperator): boolean {
    let value = primitiveAsNumber(first);
    let filterValue = primitiveAsNumber(filter.value);

    switch (operator) {
        case FilterComparisonOperator.GREATER_THAN:
            return value > filterValue;
        case FilterComparisonOperator.GREATER_THAN_EQUAL:
            return value >= filterValue;
        case FilterComparisonOperator.LESS_THAN:
            return value < filterValue;
        case FilterComparisonOperator.LESS_THAN_EQUAL:
            return value <= filterValue;
    }
}

export function shouldFilterOutEntry(entry: JournalEntry, filters: JournalEntryFilter[], filterOutMissing = true): boolean {
    for (let filter of filters) {
        let answer = entry.answers[filter.field];
        if (answer == undefined) {
            // If answer is not present at all, filter it out
            if (filterOutMissing) {
                return true;
            } else {
                continue;
            }
        }

        let extracted = extractValueFromDisplay(answer);
        if (!isFilterMet(extracted, filter)) return true;
    }
    return false;
}
