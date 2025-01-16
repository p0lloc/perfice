import {FormQuestionDisplayType} from "@perfice/model/form/form";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export type FormQuestionDisplaySettings =
    DisplayDef<FormQuestionDisplayType.INPUT, InputFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.SELECT, SelectFormQuestionSettings>;

export type DisplayDef<K extends FormQuestionDisplayType, S extends object> = {
    dataType: K,
    dataSettings: S
}

export interface InputFormQuestionSettings {}

export interface SelectOption {
    id: string;
    text: string;
    value: PrimitiveValue;
}
export interface SelectFormQuestionSettings {
    options: SelectOption[];
}
