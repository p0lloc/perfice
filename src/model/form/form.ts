import type {FormQuestionDataSettings} from "@perfice/model/form/data";
import type {FormQuestionDisplaySettings} from "@perfice/model/form/display";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {TextOrDynamic} from "@perfice/model/variable/variable";

export enum FormQuestionDataType {
    TEXT = "TEXT",
    RICH_TEXT = "RICH_TEXT",
    HIERARCHY = "HIERARCHY",
    NUMBER = "NUMBER",
    DATE = "DATE",
    TIME_ELAPSED = "TIME_ELAPSED",
    DATE_TIME = "DATE_TIME",
    TIME_OF_DAY = "TIME_OF_DAY",
    BOOLEAN = "BOOLEAN",
}

export function isFormQuestionNumberRepresentable(dataType: FormQuestionDataType) {
    return dataType === FormQuestionDataType.NUMBER || dataType == FormQuestionDataType.TIME_ELAPSED;
}

export enum FormQuestionDisplayType {
    INPUT = "INPUT",
    SELECT = "SELECT",
    HIERARCHY = "HIERARCHY",
    RANGE = "RANGE",
    SEGMENTED = "SEGMENTED",
    RICH_INPUT = "RICH_INPUT",
    TEXT_AREA = "TEXT_AREA",
}

export interface Form {
    id: string;
    name: string;
    icon: string;
    snapshotId: string;
    format: TextOrDynamic[];
    questions: FormQuestion[];
}

export interface FormTemplate {
    id: string;
    formId: string;
    name: string;
    answers: Record<string, PrimitiveValue>;
}

export type FormQuestion = {
        id: string;
        name: string;
        unit: string | null;
        defaultValue: PrimitiveValue | null;
    }
    & FormQuestionDataSettings
    & FormQuestionDisplaySettings;

export interface FormSnapshot {
    id: string;
    formId: string;
    questions: FormQuestion[];
    format: TextOrDynamic[];
}
