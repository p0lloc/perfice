export enum PrimitiveValueType {
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    LIST = "LIST",
    MAP = "MAP",
    JOURNAL_ENTRY = "JOURNAL_ENTRY",
    TAG_ENTRY = "TAG_ENTRY",
    DISPLAY = "DISPLAY",
    COMPARISON_RESULT = "COMPARISON_RESULT",
    NULL = "NULL",
}

export type PrimitiveValue =
    PV<PrimitiveValueType.STRING, string>
    | PV<PrimitiveValueType.NUMBER, number>
    | PV<PrimitiveValueType.BOOLEAN, boolean>
    | { type: PrimitiveValueType.MAP, value: Record<string, PrimitiveValue> } // Can't circularly reference PrimitiveValue without indirection
    | PV<PrimitiveValueType.LIST, PrimitiveValue[]>
    | PV<PrimitiveValueType.JOURNAL_ENTRY, JournalEntryValue>
    | PV<PrimitiveValueType.TAG_ENTRY, TagEntryValue>
    | PV<PrimitiveValueType.DISPLAY, DisplayValue>
    | PV<PrimitiveValueType.COMPARISON_RESULT, ComparisonResultValue>
    | PV<PrimitiveValueType.NULL, null>;


export type PV<T extends PrimitiveValueType, V> = {
    type: T;
    value: V;
}

export interface JournalEntryValue {
    // Id of the journal entry
    id: string;
    // Timestamp of the journal entry
    timestamp: number;
    // Entry values
    value: Record<string, PrimitiveValue>;
}

export interface TagEntryValue {
    // Id of the tag entry
    id: string;
    // Timestamp of the tag entry
    timestamp: number;
}

export interface ComparisonResultValue {
    source: PrimitiveValue;
    target: PrimitiveValue;
    met: boolean;
}

export interface DisplayValue {
    // Raw value
    value: PrimitiveValue;
    // (optional) Way to display this value
    display: PrimitiveValue | null;
}

export function pString(value: string): PrimitiveValue {
    return {type: PrimitiveValueType.STRING, value}
}

export function pNumber(value: number): PrimitiveValue {
    return {type: PrimitiveValueType.NUMBER, value}
}

export function pBoolean(value: boolean): PrimitiveValue {
    return {type: PrimitiveValueType.BOOLEAN, value}
}

export function pMap(value: Record<string, PrimitiveValue>): PrimitiveValue {
    return {type: PrimitiveValueType.MAP, value}
}

export function pList(value: PrimitiveValue[]): PrimitiveValue {
    return {type: PrimitiveValueType.LIST, value}
}

export function pDisplay(value: PrimitiveValue, display: PrimitiveValue | null): PrimitiveValue {
    return {type: PrimitiveValueType.DISPLAY, value: {value, display}}
}

export function pJournalEntry(id: string, timestamp: number, value: Record<string, PrimitiveValue>): PrimitiveValue {
    return {type: PrimitiveValueType.JOURNAL_ENTRY, value: {id, timestamp, value}}
}

export function pTagEntry(id: string, timestamp: number): PrimitiveValue {
    return {type: PrimitiveValueType.TAG_ENTRY, value: {id, timestamp}}
}

export function pComparisonResult(source: PrimitiveValue, target: PrimitiveValue, result: boolean): PrimitiveValue {
    return {type: PrimitiveValueType.COMPARISON_RESULT, value: {source, target, met: result}}
}

export function pNull(): PrimitiveValue {
    return {type: PrimitiveValueType.NULL, value: null}
}

export function getDefaultPrimitiveValue(t: PrimitiveValueType): PrimitiveValue {
    switch (t) {
        case PrimitiveValueType.LIST:
            return pList([]);
        case PrimitiveValueType.NUMBER:
            return pNumber(0.0);
        case PrimitiveValueType.BOOLEAN:
            return pBoolean(false);
        case PrimitiveValueType.JOURNAL_ENTRY:
            return pJournalEntry("", 0, {});
        case PrimitiveValueType.TAG_ENTRY:
            return pTagEntry("", 0);
        case PrimitiveValueType.DISPLAY:
            return pDisplay(pNull(), pNull());
        case PrimitiveValueType.COMPARISON_RESULT:
            return pComparisonResult(pNull(), pNull(), false);
        case PrimitiveValueType.MAP:
            return pMap({});
        case PrimitiveValueType.NULL:
            return pNull();
        case PrimitiveValueType.STRING:
            return pString("");

    }
}

export function comparePrimitives(first: PrimitiveValue, second: PrimitiveValue): boolean {
    if (first.type != second.type)
        return false;

    return comparePrimitiveValues(first.type, first.value, second.value);
}


/**
 * Compares two primitive values, but first converts the first value to the type of the second value.
 */
export function comparePrimitivesLoosely(first: PrimitiveValue, second: PrimitiveValue): boolean {
    if (first.type == PrimitiveValueType.LIST && second.type != PrimitiveValueType.LIST) {
        // If the value is a list, check if any of the values in the list loosely match
        // If both of them are lists, compare them like usual

        if (first.value.some(v => comparePrimitivesLoosely(v, second))) {
            return true;
        }
    }

    let valueConverted = primitiveAsType(first, second.type);
    return comparePrimitives(valueConverted, second);
}

function comparePrimitiveLists(firstList: PrimitiveValue[], secondList: PrimitiveValue[]): boolean {
    if (firstList.length != secondList.length) // Lengths must clearly match
        return false;

    // Compare all individual values
    for (let i = 0; i < firstList.length; i++) {
        if (!comparePrimitives(firstList[i], secondList[i])) return false;
    }

    return true;
}

function comparePrimitiveMaps(firstMap: Record<string, PrimitiveValue>, secondMap: Record<string, PrimitiveValue>): boolean {
    throw new Error("Not implemented yet")
}

function compareNullables<T>(first: T | null, second: T | null, compareFunc: (first: T, second: T) => boolean): boolean {
    // Both must be either null or non-null.
    if (first == null) {
        return second == null;
    }

    if (second == null) {
        return true;
    }

    return compareFunc(first, second);
}

function comparePrimitiveValues<T>(type: PrimitiveValueType, first: T, second: T): boolean {
    switch (type) {
        case PrimitiveValueType.LIST: {
            return comparePrimitiveLists(first as PrimitiveValue[], second as PrimitiveValue[])
        }

        case PrimitiveValueType.MAP: {
            return comparePrimitiveMaps(first as Record<string, PrimitiveValue>, second as Record<string, PrimitiveValue>);
        }

        case PrimitiveValueType.JOURNAL_ENTRY: {
            let firstEntry = first as JournalEntryValue;
            let secondEntry = second as JournalEntryValue;

            return firstEntry.id == secondEntry.id && firstEntry.timestamp == secondEntry.timestamp
                && comparePrimitiveMaps(firstEntry.value, secondEntry.value);
        }

        case PrimitiveValueType.DISPLAY: {
            let firstDisplay = first as DisplayValue;
            let secondDisplay = second as DisplayValue;

            if (!comparePrimitives(firstDisplay.value, secondDisplay.value))
                return false;

            return compareNullables(firstDisplay.display, secondDisplay.display,
                (f, v) => comparePrimitives(f, v))
        }

        default:
            return first == second;
    }
}

export function prettyPrintPrimitive(v: PrimitiveValue): string {
    switch (v.type) {
        case PrimitiveValueType.DISPLAY: {
            return prettyPrintPrimitive(v.value.display ?? v.value.value);
        }
        case PrimitiveValueType.JOURNAL_ENTRY: {
            return JSON.stringify(Object.fromEntries(Object.entries(v.value.value)
                .map(([k, v]) => [k, prettyPrintPrimitive(v)])));
        }
        case PrimitiveValueType.LIST: {
            return v.value.map(prettyPrintPrimitive).join(", ");
        }

        case PrimitiveValueType.NUMBER: {
            return Math.round(v.value).toString();
        }

        default:
            return v.value?.toString() ?? "";
    }
}

export function primitiveAsNumber(value: PrimitiveValue): number {
    if (value.type == PrimitiveValueType.STRING) {
        let float = parseFloat(value.value);
        if (isFinite(float)) {
            return float;
        }
    }
    if (value.type == PrimitiveValueType.NUMBER) {
        return value.value;
    }

    return 0;
}


export function primitiveAsString(value: PrimitiveValue): string {
    if (value.type == PrimitiveValueType.STRING) {
        return value.value;
    }

    return value.value?.toString() ?? "";
}

export function primitiveAsType(value: PrimitiveValue, type: PrimitiveValueType): PrimitiveValue {
    if (value.type == type) return value;

    if (type == PrimitiveValueType.NUMBER) {
        let v = pNumber(primitiveAsNumber(value));
        return v;
    }

    if (type == PrimitiveValueType.STRING) {
        return pString(primitiveAsString(value));
    }

    return getDefaultPrimitiveValue(type);
}
