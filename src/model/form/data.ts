import type {FormQuestionDataType} from "@perfice/model/form/form";
import type { TextFormQuestionDataSettings } from "./data/text";
import type { RichTextFormQuestionDataSettings } from "./data/rich-text";
import type { HierarchyFormQuestionDataSettings } from "./data/hierarchy";
import type { NumberFormQuestionDataSettings } from "./data/number";
import type { BooleanFormQuestionDataSettings } from "./data/boolean";
import type { DateFormQuestionDataSettings } from "./data/date";
import type { DateTimeFormQuestionDataSettings } from "./data/date-time";
import type { TimeElapsedFormQuestionDataSettings } from "./data/time-elapsed";
import type { TimeOfDayFormQuestionDataSettings } from "./data/time-of-day";

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

