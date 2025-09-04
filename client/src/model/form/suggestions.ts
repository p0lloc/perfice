import type {TextOrDynamic} from "@perfice/model/variable/variable";
import {type Form, type FormQuestion, FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
import type {FormQuestionDataSettings} from "@perfice/model/form/data";
import type {FormQuestionDisplaySettings} from "@perfice/model/form/display";
import {HIERARCHY_ROOT_ID, type HierarchyOption} from "@perfice/model/form/data/hierarchy";
import {pBoolean, pNumber, primitiveAsString, type PrimitiveValue, pString} from "@perfice/model/primitive/primitive";
import type {RangeFormQuestionSettings} from "@perfice/model/form/display/range";
import type {SelectGrid, SelectOption} from "@perfice/model/form/display/select";
import type {SegmentedOption} from "@perfice/model/form/display/segmented";
import {Capacitor} from "@capacitor/core";

export interface FormSuggestion {
    format: TextOrDynamic[];
    questions: FormQuestionSuggestion[];
}

export function serializeFormToSuggestion(form: Form): FormSuggestion {
    return {
        format: form.format,
        questions: form.questions.map(q => serializeFormQuestionToSuggestion(q))
    }
}

export function serializeFormQuestionToSuggestion(question: FormQuestion): FormQuestionSuggestion {
    return {
        id: question.id,
        name: question.name,
        unit: question.unit ?? undefined,
        ...serializeDataSettings(question),
        ...serializeDisplaySettings(question)
    }
}

function serializeDisplaySettings(question: FormQuestion): FormQuestionSuggestionDisplaySettings {
    switch (question.displayType) {
        case FormQuestionDisplayType.SELECT: {
            let displaySettings = question.displaySettings;
            return {
                displayType: FormQuestionDisplayType.SELECT,
                displaySettings: {
                    options: displaySettings.options.map(o => {
                        return {
                            text: o.text,
                            value: o.value.value as string | number,
                            icon: o.icon ?? undefined,
                            iconAndText: o.iconAndText
                        }
                    }),
                    multiple: displaySettings.multiple,
                    grid: displaySettings.grid ?? undefined
                }
            }
        }

        case FormQuestionDisplayType.SEGMENTED: {
            let displaySettings = question.displaySettings;
            return {
                displayType: FormQuestionDisplayType.SEGMENTED,
                displaySettings: {
                    options: displaySettings.options.map(o => {
                        return {
                            text: o.text,
                            value: o.value.value as string | number,
                        }
                    })
                }
            }
        }

        case FormQuestionDisplayType.RANGE: {
            let displaySettings = question.displaySettings;
            return {
                displayType: FormQuestionDisplayType.RANGE,
                displaySettings: {
                    step: displaySettings.step
                }
            }
        }
        default: {
            return {
                displayType: question.displayType,
                displaySettings: {}
            } as FormQuestionSuggestionDisplaySettings
        }
    }
}

function serializeHierarchyOption(option: HierarchyOption): HierarchySuggestionOption {
    return {
        value: option.value.value as string | number,
        text: option.text,
        color: option.color,
        gridSize: option.gridSize,
        children: option.children.map(c => serializeHierarchyOption(c))
    }
}

function serializeDataSettings(question: FormQuestion): FormQuestionSuggestionDataSettings {
    switch (question.dataType) {
        case FormQuestionDataType.HIERARCHY: {
            let dataSettings = question.dataSettings;
            return {
                dataType: FormQuestionDataType.HIERARCHY,
                dataSettings: {
                    root: serializeHierarchyOption(dataSettings.root)
                }
            }
        }
        case FormQuestionDataType.NUMBER: {
            return {
                dataType: FormQuestionDataType.NUMBER,
                dataSettings: {
                    min: question.dataSettings.min ?? undefined,
                    max: question.dataSettings.max ?? undefined
                }
            }
        }
        default: {
            return {
                dataType: question.dataType,
                dataSettings: {}
            }
        }
    }
}

export function updateTextOrDynamicAssigned(textOrDynamic: TextOrDynamic[], assignedQuestions: Map<string, string>): TextOrDynamic[] {
    // Replace dynamic values with assigned question ids
    return textOrDynamic.map(t => {
        if (!t.dynamic) return t;

        let questionId = assignedQuestions.get(t.value);
        if (questionId == null) return t;

        return {
            value: questionId,
            dynamic: true
        }
    });
}

export function parseFormSuggestion(suggestion: FormSuggestion, name: string, icon: string): [Form, Map<string, string>] {
    let assignedQuestions = new Map<string, string>();
    let questions = suggestion.questions.map(q => parseFormQuestionSuggestion(q, assignedQuestions));

    let form: Form = {
        id: crypto.randomUUID(),
        snapshotId: "",
        name,
        icon,
        format: updateTextOrDynamicAssigned(suggestion.format, assignedQuestions),
        questions
    }

    return [form, assignedQuestions];
}

function parseBasicValue(v: string | number | boolean | null | undefined): PrimitiveValue | null {
    if (v == null) return null;

    switch (typeof v) {
        case "string":
            return pString(v);
        case "number":
            return pNumber(v);
        case "boolean":
            return pBoolean(v);
        default:
            return null;
    }
}

export function parseFormQuestionSuggestion(suggestion: FormQuestionSuggestion, assignedQuestions: Map<string, string>): FormQuestion {
    let existingId = suggestion.id;
    let id = crypto.randomUUID();
    if (existingId != null) {
        assignedQuestions.set(existingId, id);
    }

    return {
        id,
        name: suggestion.name,
        unit: suggestion.unit ?? null,
        defaultValue: parseBasicValue(suggestion.defaultValue),
        ...parseDataSettings(suggestion),
        ...parseDisplaySettings(suggestion)
    }
}


export function parseDataSettings(v: FormQuestionSuggestionDataSettings): FormQuestionDataSettings {
    switch (v.dataType) {
        case FormQuestionDataType.TEXT: {
            return {
                dataType: FormQuestionDataType.TEXT,
                dataSettings: {
                    minLength: null,
                    maxLength: null
                }
            }
        }
        case FormQuestionDataType.BOOLEAN: {
            return {
                dataType: FormQuestionDataType.BOOLEAN,
                dataSettings: {}
            }
        }
        case FormQuestionDataType.RICH_TEXT: {
            return {
                dataType: FormQuestionDataType.RICH_TEXT,
                dataSettings: {}
            }
        }
        case FormQuestionDataType.DATE: {
            return {
                dataType: FormQuestionDataType.DATE,
                dataSettings: {}
            }
        }
        case FormQuestionDataType.DATE_TIME: {
            return {
                dataType: FormQuestionDataType.DATE_TIME,
                dataSettings: {}
            }
        }
        case FormQuestionDataType.TIME_ELAPSED: {
            return {
                dataType: FormQuestionDataType.TIME_ELAPSED,
                dataSettings: {}
            }
        }
        case FormQuestionDataType.TIME_OF_DAY: {
            return {
                dataType: FormQuestionDataType.TIME_OF_DAY,
                dataSettings: {}
            }
        }
        case FormQuestionDataType.HIERARCHY: {
            return {
                dataType: FormQuestionDataType.HIERARCHY,
                dataSettings: {
                    root: v.dataSettings != null ? parseHierarchyOption(v.dataSettings?.root, true) : {
                        id: HIERARCHY_ROOT_ID,
                        value: pString(""),
                        text: "",
                        color: "#ff0000",
                        gridSize: 2,
                        children: []
                    }
                }
            }
        }
        case FormQuestionDataType.NUMBER: {
            return {
                dataType: FormQuestionDataType.NUMBER,
                dataSettings: {
                    min: v.dataSettings?.min ?? null,
                    max: v.dataSettings?.max ?? null
                }
            }
        }
    }
}

export function parseHierarchyOption(v: HierarchySuggestionOption, root: boolean): HierarchyOption {
    return {
        id: root ? HIERARCHY_ROOT_ID : crypto.randomUUID(),
        value: typeof v.value == "string" ? pString(v.value) : pNumber(v.value),
        text: v.text,
        color: v.color,
        gridSize: v.gridSize,
        children: v.children.map(c => parseHierarchyOption(c, false))
    }
}

export function parseSelectOption(v: SelectOptionSuggestion): SelectOption {
    let value = typeof v.value == "string" ? pString(v.value) : pNumber(v.value);
    return {
        id: v.id ?? crypto.randomUUID(),
        text: v.text ?? primitiveAsString(value),
        value: value,
        icon: v.icon ?? null,
        iconAndText: v.iconAndText ?? false
    }
}

export function parseSegmentedItem(v: SegmentedItemSuggestion): SegmentedOption {
    return {
        id: crypto.randomUUID(),
        value: typeof v.value == "string" ? pString(v.value) : pNumber(v.value),
        text: v.text
    }
}

/**
 * Parses a number value for responsive design.
 * Follows format [<value on desktop>, <value on mobile>].
 */
function parseResponsiveNumber(v: number | number[]): number {
    if (Array.isArray(v)) {
        return v[Capacitor.isNativePlatform() ? 1 : 0];
    } else {
        return v;
    }
}

function parseSelectGrid(v: SelectSuggestionGrid): SelectGrid {
    return {
        itemsPerRow: parseResponsiveNumber(v.itemsPerRow),
        border: v.border
    }
}

export function parseDisplaySettings(v: FormQuestionSuggestionDisplaySettings): FormQuestionDisplaySettings {
    switch (v.displayType) {
        case FormQuestionDisplayType.SELECT: {
            return {
                displayType: FormQuestionDisplayType.SELECT,
                displaySettings: {
                    options: v.displaySettings?.options.map(parseSelectOption) ?? [],
                    multiple: v.displaySettings?.multiple ?? false,
                    grid: (v.displaySettings?.grid ?? null) != null ? parseSelectGrid(v.displaySettings!.grid!) : null
                }
            }
        }
        case FormQuestionDisplayType.HIERARCHY: {
            return {
                displayType: FormQuestionDisplayType.HIERARCHY,
                displaySettings: {
                    onlyLeafOption: true
                }
            }
        }
        case FormQuestionDisplayType.RANGE: {
            return {
                displayType: FormQuestionDisplayType.RANGE,
                displaySettings: {
                    step: v.displaySettings?.step ?? 1
                }
            }
        }
        case FormQuestionDisplayType.SEGMENTED: {
            return {
                displayType: FormQuestionDisplayType.SEGMENTED,
                displaySettings: {
                    options: v.displaySettings?.options.map(parseSegmentedItem) ?? []
                }
            }
        }
        case FormQuestionDisplayType.RICH_INPUT: {
            return {
                displayType: FormQuestionDisplayType.RICH_INPUT,
                displaySettings: {}
            }
        }
        default: {
            return {
                displayType: v.displayType,
                displaySettings: {}
            }
        }
    }
}

export type FormQuestionSuggestion = {
    id?: string;
    name: string;
    unit: string | undefined;
    defaultValue?: string | number | boolean | null;
} & FormQuestionSuggestionDataSettings & FormQuestionSuggestionDisplaySettings;

export type FormQuestionSuggestionDataSettings =
    SuggestionDataDef<FormQuestionDataType.TEXT, EmptySuggestionDataSettings>
    | SuggestionDataDef<FormQuestionDataType.BOOLEAN, EmptySuggestionDataSettings>
    | SuggestionDataDef<FormQuestionDataType.RICH_TEXT, EmptySuggestionDataSettings>
    | SuggestionDataDef<FormQuestionDataType.DATE, EmptySuggestionDataSettings>
    | SuggestionDataDef<FormQuestionDataType.DATE_TIME, EmptySuggestionDataSettings>
    | SuggestionDataDef<FormQuestionDataType.TIME_ELAPSED, EmptySuggestionDataSettings>
    | SuggestionDataDef<FormQuestionDataType.TIME_OF_DAY, EmptySuggestionDataSettings>
    | SuggestionDataDef<FormQuestionDataType.HIERARCHY, HierarchySuggestionDataSettings>
    | SuggestionDataDef<FormQuestionDataType.NUMBER, NumberSuggestionDataSettings>;

export type FormQuestionSuggestionDisplaySettings =
    SuggestionDisplayDef<FormQuestionDisplayType.SELECT, SelectSuggestionDisplaySettings>
    | SuggestionDisplayDef<FormQuestionDisplayType.INPUT, EmptySuggestionDisplaySettings>
    | SuggestionDisplayDef<FormQuestionDisplayType.TEXT_AREA, EmptySuggestionDisplaySettings>
    | SuggestionDisplayDef<FormQuestionDisplayType.HIERARCHY, EmptySuggestionDisplaySettings>
    | SuggestionDisplayDef<FormQuestionDisplayType.RANGE, RangeFormQuestionSettings>
    | SuggestionDisplayDef<FormQuestionDisplayType.SEGMENTED, SegmentedSuggestionDisplaySettings>
    | SuggestionDisplayDef<FormQuestionDisplayType.RICH_INPUT, EmptySuggestionDisplaySettings>
    ;

export interface EmptySuggestionDisplaySettings {
}

export type SuggestionDataDef<K extends FormQuestionDataType, S extends object> = {
    dataType: K,
    dataSettings?: S
}

export type SuggestionDisplayDef<K extends FormQuestionDisplayType, S extends object> = {
    displayType: K,
    displaySettings?: S
}

export interface EmptySuggestionDataSettings {
}

export interface NumberSuggestionDataSettings {
    min?: number;
    max?: number;
}

export interface HierarchySuggestionOption {
    value: string | number;
    text: string;
    color: string;
    gridSize: number;
    children: HierarchySuggestionOption[];
}

export interface HierarchySuggestionDataSettings {
    root: HierarchySuggestionOption;
}

export interface SelectOptionSuggestion {
    id?: string;
    text?: string;
    value: string | number;
    icon?: string;
    iconAndText?: boolean;
}

export interface SelectSuggestionGrid {
    itemsPerRow: number | number[];
    border: boolean;
}

export interface SelectSuggestionDisplaySettings {
    options: SelectOptionSuggestion[];
    multiple?: boolean;
    grid?: SelectSuggestionGrid;
}


export interface SegmentedSuggestionDisplaySettings {
    options: SegmentedItemSuggestion[];
}

export interface SegmentedItemSuggestion {
    text: string;
    value: string | number;
}

export function manipulateTextOrDynamic(suggestion: TextOrDynamic, assignedQuestions: Map<string, string>): TextOrDynamic {
    if (suggestion.dynamic) {
        return {
            ...suggestion,
            value: assignedQuestions.get(suggestion.value) ?? suggestion.value
        };
    }

    return suggestion;
}
