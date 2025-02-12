import type {FormQuestionDisplaySettingsValue} from "./display";
import type {FormQuestionDataSettings} from "@perfice/model/form/data";
import {FormQuestionDataType, FormQuestionDisplayType } from "./form";
import {faBorderAll, faCalendar, faCircleDot, faFolderTree, faHashtag, faKeyboard,
    faRulerHorizontal, faStopwatch, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faFont } from "@fortawesome/free-solid-svg-icons/faFont";

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

// TODO: should we register these in the data definitions with associated name and icon?
export const QUESTION_DATA_TYPES: FriendlyQuestionDataType [] = [
    {
        name: "Text",
        type: FormQuestionDataType.TEXT,
        icon: faFont
    },

    {
        name: "Number",
        type: FormQuestionDataType.NUMBER,
        icon: faHashtag
    },


    {
        name: "Time elapsed",
        type: FormQuestionDataType.TIME_ELAPSED,
        icon: faStopwatch
    },

    {
        name: "Date",
        type: FormQuestionDataType.DATE,
        icon: faCalendar
    },

    {
        name: "Date & time",
        type: FormQuestionDataType.DATE_TIME,
        icon: faCalendar
    },

    {
        name: "True/false",
        type: FormQuestionDataType.BOOLEAN,
        icon: faHashtag
    },

    {
        name: "Time of day",
        type: FormQuestionDataType.TIME_OF_DAY,
        icon: faCalendar
    },


    {
        name: "Rich text",
        type: FormQuestionDataType.RICH_TEXT,
        icon: faCalendar
    },

    {
        name: "Hierarchy",
        type: FormQuestionDataType.HIERARCHY,
        icon: faCalendar
    }
];



export const QUESTION_DISPLAY_TYPES: FriendlyQuestionDisplayType[] = [
    {
        name: "Input",
        type: FormQuestionDisplayType.INPUT,
        icon: faKeyboard
    },

    {
        name: "Select",
        type: FormQuestionDisplayType.SELECT,
        icon: faBorderAll
    },
    {
        name: "Segmented",
        type: FormQuestionDisplayType.SEGMENTED,
        icon: faCircleDot
    },
    {
        name: "Hierarchy",
        type: FormQuestionDisplayType.HIERARCHY,
        icon: faFolderTree
    },
    {
        name: "Range",
        type: FormQuestionDisplayType.RANGE,
        icon: faRulerHorizontal
    },
    {
        name: "Rich input",
        type: FormQuestionDisplayType.RICH_INPUT,
        icon: faFont
    },
];
