import {FormQuestionDisplayType} from "@perfice/model/form/form";
import type {InputFormQuestionSettings} from "@perfice/model/form/display/input";
import type {SelectFormQuestionSettings} from "./display/select";
import type {HierarchyFormQuestionSettings} from "./display/hierarchy";
import type {RangeFormQuestionSettings} from "@perfice/model/form/display/range";
import type {SegmentedFormQuestionSettings} from "@perfice/model/form/display/segmented";

export type FormQuestionDisplaySettings =
    DisplayDef<FormQuestionDisplayType.INPUT, InputFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.SELECT, SelectFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.RANGE, RangeFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.HIERARCHY, HierarchyFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.SEGMENTED, SegmentedFormQuestionSettings>;

export type DisplayDef<K extends FormQuestionDisplayType, S extends object> = {
    dataType: K,
    dataSettings: S
}
