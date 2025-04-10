import type {FormQuestionDisplaySettingsValue} from "./display";
import type {DataSettingValues, FormQuestionDataSettings} from "@perfice/model/form/data";
import {FormQuestionDataType, FormQuestionDisplayType} from "./form";
import {
    faBorderAll, faCalendar, faCheck, faCircleDot, faFolderTree, faHashtag, faKeyboard,
    faRulerHorizontal, faStopwatch, type IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import {faFont} from "@fortawesome/free-solid-svg-icons/faFont";

export const NEW_FORM_ROUTE = "new";

export interface FormFieldProps {
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


export interface FriendlyQuestionDataType {
    name: string;
    type: FormQuestionDataType;
    icon: IconDefinition;
}

export interface FriendlyQuestionDisplayType {
    name: string;
    type: FormQuestionDisplayType;
    icon: IconDefinition;
}

