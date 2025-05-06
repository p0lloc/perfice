import {type FormQuestion, FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
import {type TextFormQuestionDataSettings, TextFormQuestionDataType} from "./data/text";
import {type RichTextFormQuestionDataSettings} from "./data/rich-text";
import {type HierarchyFormQuestionDataSettings, HierarchyFormQuestionDataType} from "./data/hierarchy";
import {type NumberFormQuestionDataSettings, NumberFormQuestionDataType} from "./data/number";
import {type BooleanFormQuestionDataSettings, BooleanFormQuestionDataType} from "./data/boolean";
import {type DateFormQuestionDataSettings, DateFormQuestionDataType} from "./data/date";
import {type DateTimeFormQuestionDataSettings, DateTimeFormQuestionDataType} from "./data/date-time";
import {type TimeElapsedFormQuestionDataSettings, TimeElapsedFormQuestionDataType} from "./data/time-elapsed";
import {type TimeOfDayFormQuestionDataSettings, TimeOfDayFormQuestionDataType} from "./data/time-of-day";
import {pList, prettyPrintPrimitive, type PrimitiveValue, type PrimitiveValueType} from "../primitive/primitive";
import type {ExportedPrimitive} from "@perfice/services/export/formEntries/export";
import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {questionDisplayTypeRegistry} from "@perfice/model/form/display";

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

export type DataSettingValues =
    TextFormQuestionDataSettings
    | NumberFormQuestionDataSettings
    | DateFormQuestionDataSettings
    | DateTimeFormQuestionDataSettings
    | TimeElapsedFormQuestionDataSettings
    | TimeOfDayFormQuestionDataSettings
    | BooleanFormQuestionDataSettings
    | RichTextFormQuestionDataSettings
    | HierarchyFormQuestionDataType;

export type DataDef<K extends FormQuestionDataType, S extends object> = {
    dataType: K,
    dataSettings: S
}

export interface FormQuestionDataTypeDefinition<V, S> {
    // Returns null if the value is valid, otherwise returns an error message
    validate(value: V, settings: S): string | null;

    getDefaultSettings(): S;

    getDefaultValue(settings: S): V;

    // Returns the primitive type that this form data type corresponds to
    getPrimitiveType(): PrimitiveValueType;

    // Serializes a primitive value to a value that can be displayed by a field
    serialize(value: PrimitiveValue): any;

    // Deserializes a value that was serialized by a field, returns null if the value is invalid
    deserialize(value: any): PrimitiveValue | null;

    // Returns a list of display types that can be used to display this data
    getSupportedDisplayTypes(): FormQuestionDisplayType[];

    getName(): string;

    getIcon(): IconDefinition;

    export(value: PrimitiveValue): ExportedPrimitive | null;

    importPrimitive(value: ExportedPrimitive): PrimitiveValue | null;

    importString?: (value: string) => PrimitiveValue | null;

    getDisplayValue(value: V): PrimitiveValue | null;
}

export class FormQuestionDataTypeRegistry {
    private types: Map<string, FormQuestionDataTypeDefinition<any, any>> = new Map();

    registerDataType<V, S>(type: string, def: FormQuestionDataTypeDefinition<V, S>) {
        this.types.set(type, def);
    }

    getDefinition(type: string): FormQuestionDataTypeDefinition<any, any> | undefined {
        return this.types.get(type);
    }

    getDefaultValue(type: string): any {
        let definition = this.getDefinition(type);
        if (definition === undefined) return undefined;
        return definition.getDefaultValue(definition.getDefaultSettings());
    }

    getDefaultPrimitiveValue(type: string): PrimitiveValue | null {
        let definition = this.getDefinition(type);
        if (definition === undefined) return null;

        return definition.deserialize(definition.getDefaultValue(definition.getDefaultSettings()));
    }

    /**
     * Gets the first data type that supports the given display type
     */
    getFirstSuitableForDisplayType(type: FormQuestionDisplayType): [string, FormQuestionDataTypeDefinition<any, any>] | null {
        for (let [key, value] of this.types.entries()) {
            if (!value.getSupportedDisplayTypes().includes(type)) continue;

            return [key, value];
        }

        return null;
    }

    getDefinitions(): [string, FormQuestionDataTypeDefinition<any, any>][] {
        return this.types.entries().toArray();
    }
}

export const questionDataTypeRegistry = new FormQuestionDataTypeRegistry();

export function registerDataTypes() {
    questionDataTypeRegistry.registerDataType(FormQuestionDataType.NUMBER, new NumberFormQuestionDataType());
    questionDataTypeRegistry.registerDataType(FormQuestionDataType.TEXT, new TextFormQuestionDataType());
    questionDataTypeRegistry.registerDataType(FormQuestionDataType.DATE, new DateFormQuestionDataType());
    questionDataTypeRegistry.registerDataType(FormQuestionDataType.TIME_ELAPSED, new TimeElapsedFormQuestionDataType());
    questionDataTypeRegistry.registerDataType(FormQuestionDataType.DATE_TIME, new DateTimeFormQuestionDataType());
    questionDataTypeRegistry.registerDataType(FormQuestionDataType.TIME_OF_DAY, new TimeOfDayFormQuestionDataType());
    questionDataTypeRegistry.registerDataType(FormQuestionDataType.BOOLEAN, new BooleanFormQuestionDataType());
    questionDataTypeRegistry.registerDataType(FormQuestionDataType.HIERARCHY, new HierarchyFormQuestionDataType());
}

//questionDataTypeRegistry.registerDataType(FormQuestionDataType.RICH_TEXT, new RichTextFormQuestionDataType());

/**
 * Formats value as specified data type, but first tries to deserialize it.
 * This almost always assumes that the value is a string.
 *
 * @param value
 * @param dataType
 */
export function deserializeAndFormatValueAsDataType(value: any, dataType: string): string {
    let dataTypeDef = questionDataTypeRegistry.getDefinition(dataType);
    if (dataTypeDef == null) return value.toString();

    let deserialized = dataTypeDef.deserialize(value);
    if (deserialized == null) return value.toString();

    return formatValueAsDataType(dataTypeDef.serialize(deserialized), dataType);
}

export function formatValueAsDataType(value: any, dataType: string): string {
    let dataTypeDef = questionDataTypeRegistry.getDefinition(dataType);
    if (dataTypeDef == null) return value.toString();

    let displayValue = dataTypeDef.getDisplayValue(value);
    if (displayValue == null) return value.toString();

    return prettyPrintPrimitive(displayValue);
}

export function getDefaultFormAnswers(questions: FormQuestion[]): Record<string, PrimitiveValue> {
    let answers: Record<string, PrimitiveValue> = {};
    for (let question of questions) {
        let displayDef = questionDisplayTypeRegistry.getFieldByType(question.displayType);
        if (displayDef == null) continue;

        let value: any;
        if (question.defaultValue != null) {
            value = question.defaultValue;
        } else {
            if (displayDef.hasMultiple(question.displaySettings)) {
                value = pList([]);
            } else {
                let definition = questionDataTypeRegistry.getDefinition(question.dataType);
                if (definition == null) continue;

                value = definition.deserialize(definition.getDefaultValue(question.dataSettings));
            }
        }

        answers[question.id] = value;
    }

    return answers;
}