import {FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
import {type TextFormQuestionDataSettings, TextFormQuestionDataType} from "./data/text";
import {type RichTextFormQuestionDataSettings, RichTextFormQuestionDataType} from "./data/rich-text";
import {type HierarchyFormQuestionDataSettings, HierarchyFormQuestionDataType} from "./data/hierarchy";
import {type NumberFormQuestionDataSettings, NumberFormQuestionDataType} from "./data/number";
import {type BooleanFormQuestionDataSettings, BooleanFormQuestionDataType} from "./data/boolean";
import {type DateFormQuestionDataSettings, DateFormQuestionDataType} from "./data/date";
import {type DateTimeFormQuestionDataSettings, DateTimeFormQuestionDataType} from "./data/date-time";
import {type TimeElapsedFormQuestionDataSettings, TimeElapsedFormQuestionDataType} from "./data/time-elapsed";
import {type TimeOfDayFormQuestionDataSettings, TimeOfDayFormQuestionDataType} from "./data/time-of-day";
import {prettyPrintPrimitive, type PrimitiveValue, type PrimitiveValueType} from "../primitive/primitive";
import type {ExportedPrimitive} from "@perfice/services/export/export";

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

    export(value: PrimitiveValue): ExportedPrimitive | null;

    import(value: ExportedPrimitive): PrimitiveValue | null;

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
}

export const questionDataTypeRegistry = new FormQuestionDataTypeRegistry();
questionDataTypeRegistry.registerDataType(FormQuestionDataType.NUMBER, new NumberFormQuestionDataType());
questionDataTypeRegistry.registerDataType(FormQuestionDataType.TEXT, new TextFormQuestionDataType());
questionDataTypeRegistry.registerDataType(FormQuestionDataType.DATE, new DateFormQuestionDataType());
questionDataTypeRegistry.registerDataType(FormQuestionDataType.TIME_ELAPSED, new TimeElapsedFormQuestionDataType());
questionDataTypeRegistry.registerDataType(FormQuestionDataType.DATE_TIME, new DateTimeFormQuestionDataType());
questionDataTypeRegistry.registerDataType(FormQuestionDataType.TIME_OF_DAY, new TimeOfDayFormQuestionDataType());
questionDataTypeRegistry.registerDataType(FormQuestionDataType.BOOLEAN, new BooleanFormQuestionDataType());
questionDataTypeRegistry.registerDataType(FormQuestionDataType.HIERARCHY, new HierarchyFormQuestionDataType());
questionDataTypeRegistry.registerDataType(FormQuestionDataType.RICH_TEXT, new RichTextFormQuestionDataType());

export function formatValueAsDataType(value: any, dataType: string): string {
    let dataTypeDef = questionDataTypeRegistry.getDefinition(dataType);
    if (dataTypeDef == null) return value.toString();

    let displayValue = dataTypeDef.getDisplayValue(value);
    if (displayValue == null) return value.toString();

    return prettyPrintPrimitive(displayValue);
}
