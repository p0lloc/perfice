export enum PrimitiveValueType {
    STRING,
    BOOLEAN,
    LIST,
    MAP,
}

export type PrimitiveValue = StringPrimitiveValue | BooleanPrimitiveValue;

export interface StringPrimitiveValue {
    type: PrimitiveValueType.STRING;
    value: string;
}
export interface BooleanPrimitiveValue {
    type: PrimitiveValueType.BOOLEAN;
    value: boolean;
}
export interface MapPrimitiveValue {
    type: PrimitiveValueType.MAP;
    value: Record<string, PrimitiveValue>;
}
