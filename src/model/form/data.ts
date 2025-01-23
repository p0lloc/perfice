import {FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
import {TextFormQuestionDataType, type TextFormQuestionDataSettings} from "./data/text";
import {RichTextFormQuestionDataType, type RichTextFormQuestionDataSettings} from "./data/rich-text";
import {HierarchyFormQuestionDataType, type HierarchyFormQuestionDataSettings} from "./data/hierarchy";
import {NumberFormQuestionDataType, type NumberFormQuestionDataSettings} from "./data/number";
import {BooleanFormQuestionDataType, type BooleanFormQuestionDataSettings} from "./data/boolean";
import {DateFormQuestionDataType, type DateFormQuestionDataSettings} from "./data/date";
import {DateTimeFormQuestionDataType, type DateTimeFormQuestionDataSettings} from "./data/date-time";
import {TimeElapsedFormQuestionDataType, type TimeElapsedFormQuestionDataSettings} from "./data/time-elapsed";
import {TimeOfDayFormQuestionDataType, type TimeOfDayFormQuestionDataSettings} from "./data/time-of-day";
import {type PrimitiveValue, type PrimitiveValueType} from "../primitive/primitive";

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
}


export class FormQuestionDataTypeRegistry {
    private types: Map<string, FormQuestionDataTypeDefinition<any, any>> = new Map();

    registerDataType<V, S>(type: string, def: FormQuestionDataTypeDefinition<V, S>) {
        this.types.set(type, def);
    }

    getDefinition(type: string): FormQuestionDataTypeDefinition<any, any> | undefined {
        return this.types.get(type);
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
