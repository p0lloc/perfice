import type {FormQuestionDisplaySettingsValue} from "./display";
import type {DataSettingValues} from "@perfice/model/form/data";
import {type FormQuestion, FormQuestionDataType, FormQuestionDisplayType} from "./form";

export const NEW_FORM_ROUTE = "new";

export interface FormFieldProps {
    unit?: string;
    displaySettings: FormQuestionDisplaySettingsValue;
    dataType: FormQuestionDataType;
    dataSettings: DataSettingValues;
    disabled: boolean;
    value: any;
    onChange: (v: any) => void;
}


export interface InputFieldProps {
    dataType: FormQuestionDataType;
    disabled: boolean;
    value: any;
    onChange: (v: any) => void;
}

export function getHtmlInputFromQuestionType(type: FormQuestionDataType): string {
    switch (type) {
        case FormQuestionDataType.TEXT:
            return "text";
        case FormQuestionDataType.NUMBER:
            return "number";
        case FormQuestionDataType.DATE:
            return "date";
        case FormQuestionDataType.DATE_TIME:
            return "datetime-local";
        default:
            return "text";
    }
}

const INPUT_AUTO_FOCUS_TYPES = [FormQuestionDataType.TEXT, FormQuestionDataType.NUMBER, FormQuestionDataType.BOOLEAN];

export function shouldAutoFocusNext(question: FormQuestion): boolean {
    switch (question.displayType) {
        case FormQuestionDisplayType.INPUT:
            return INPUT_AUTO_FOCUS_TYPES.includes(question.dataType);
        case FormQuestionDisplayType.SEGMENTED:
            return true;
        case FormQuestionDisplayType.SELECT:
            return !question.displaySettings.multiple;
        default:
            return false;
    }
}

