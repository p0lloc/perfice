import type {FormQuestionDataType} from "@perfice/model/form/form";

export type FormQuestionDataSettings =
    DataDef<FormQuestionDataType.TEXT, TextFormQuestionDataSettings>
    | DataDef<FormQuestionDataType.RICH_TEXT, RichTextFormQuestionDataSettings>
    | DataDef<FormQuestionDataType.HIERARCHY, HierarchyFormQuestionDataSettings>
    | DataDef<FormQuestionDataType.NUMBER, NumberFormQuestionDataSettings>
    | DataDef<FormQuestionDataType.BOOLEAN, BooleanFormQuestionDataSettings>
    | DataDef<FormQuestionDataType.DATE, DateFormQuestionDataSettings>
    | DataDef<FormQuestionDataType.DATE_TIME, DateTimeFormQuestionDataSettings>
    | DataDef<FormQuestionDataType.TIME_ELAPSED, TimeElapsedFormQuestionDataSettings>
    | DataDef<FormQuestionDataType.TIME_OF_DAY, TimeOfDayFormQuestionDataSettings>
    ;

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
export interface BooleanFormQuestionDataSettings {}
export interface DateFormQuestionDataSettings {}
export interface DateTimeFormQuestionDataSettings {}
export interface TimeElapsedFormQuestionDataSettings {}
export interface RichTextFormQuestionDataSettings {}
export interface HierarchyFormQuestionDataSettings {}
export interface TimeOfDayFormQuestionDataSettings {}
