import type {FormQuestionDataType} from "@perfice/model/form/form";

export type FormQuestionDataSettings =
    DataDef<FormQuestionDataType.TEXT, TextFormQuestionDataSettings>
    | DataDef<FormQuestionDataType.NUMBER, NumberFormQuestionDataSettings>;

export type DataDef<K extends FormQuestionDataType, S extends object> = {
    dataType: K,
    dataSettings: S
}

export interface TextFormQuestionDataSettings {
    minLength: number | null;
    maxLength: number | null;
}
export interface NumberFormQuestionDataSettings {
    min: number | null;
    max: number | null;
}
