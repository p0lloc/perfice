import type {FormQuestionDisplaySettingsValue} from "./display";
import type {FormQuestionDataSettings} from "@perfice/model/form/data";
import { FormQuestionDataType } from "./form";

export interface FormFieldProps {
    displaySettings: FormQuestionDisplaySettingsValue;
    dataSettings: FormQuestionDataSettings;
    disabled: boolean;
    value: any;
    onChange: (v: any) => void;
}


export interface InputFieldProps {
    dataType: FormQuestionDataType;
    disabled: boolean;
    value: string;
    onChange: (v: string) => void;
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
