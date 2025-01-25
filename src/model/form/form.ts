import type {FormQuestionDataSettings} from "@perfice/model/form/data";
import type {FormQuestionDisplaySettings} from "@perfice/model/form/display";

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

export enum FormQuestionDisplayType {
    INPUT = "INPUT",
    SELECT = "SELECT",
    HIERARCHY = "HIERARCHY",
    RANGE = "RANGE",
    SEGMENTED = "SEGMENTED",
    RICH_INPUT = "RICH_INPUT",
}

export interface Form {
    id: string;
    name: string;
    snapshotId: string;
    questions: FormQuestion[];
}

export type FormQuestion = {
        id: string;
        name: string;
    }
    & FormQuestionDataSettings
    & FormQuestionDisplaySettings;

export interface FormSnapshot {
    id: string;
    formId: string;
    questions: FormQuestion[];
}
