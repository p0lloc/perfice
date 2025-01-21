import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export interface SelectOption {
    id: string;
    text: string;
    value: PrimitiveValue;
}
export interface SelectFormQuestionSettings {
    options: SelectOption[];
}
