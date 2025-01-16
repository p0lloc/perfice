export enum PrimitiveValueType {
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    LIST = "LIST",
    MAP = "MAP",
    ENTRY = "ENTRY",
    DISPLAY = "DISPLAY",
    NULL = "NULL",
}

export type PrimitiveValue =
    PV<PrimitiveValueType.STRING, string>
    | PV<PrimitiveValueType.NUMBER, number>
    | PV<PrimitiveValueType.BOOLEAN, boolean>
    | { type: PrimitiveValueType.MAP, value: Record<string, PrimitiveValue> } // Can't circularly reference PrimitiveValue without indirection
    | PV<PrimitiveValueType.LIST, PrimitiveValue[]>
    | PV<PrimitiveValueType.ENTRY, EntryValue>
    | PV<PrimitiveValueType.DISPLAY, DisplayValue>
    | PV<PrimitiveValueType.NULL, null>;


export type PV<T extends PrimitiveValueType, V> = {
    type: T;
    value: V;
}

export interface EntryValue {
    // Id of the journal entry
    id: string;
    // Timestamp of the journal entry
    timestamp: number;
    // Entry values
    value: Record<string, PrimitiveValue>;
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

export function pEntry(value: EntryValue): PrimitiveValue {
    return {type: PrimitiveValueType.ENTRY, value}
}

export function pNull(): PrimitiveValue {
    return {type: PrimitiveValueType.NULL, value: null}
}

export function comparePrimitives(first: PrimitiveValue, second: PrimitiveValue): boolean {
    if (first.type != second.type)
        return false;

    return comparePrimitiveValues(first.type, first.value, second.value);
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

        case PrimitiveValueType.ENTRY: {
            let firstEntry = first as EntryValue;
            let secondEntry = second as EntryValue;

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