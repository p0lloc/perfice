import type {FormQuestionDataSettings} from "@perfice/model/form/data";
import type {FormQuestionDisplaySettings} from "@perfice/model/form/display";

export enum FormQuestionDataType {
    TEXT = "TEXT",
    RICH_TEXT = "RICH_TEXT",
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
    SEGMENTED = "SEGMENTED"
}

export interface Form {
    id: string;
    name: string;
    questions: FormQuestion[];
}

export type FormQuestion = {
        id: string;
        name: string;
    }
    & FormQuestionDataSettings
    & FormQuestionDisplaySettings;
