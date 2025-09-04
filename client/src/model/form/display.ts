import {FormQuestionDisplayType} from "@perfice/model/form/form";
import {InputFieldDefinition, type InputFormQuestionSettings} from "@perfice/model/form/display/input";
import {SelectFieldDefinition, type SelectFormQuestionSettings} from "./display/select";
import {HierarchyFieldDefinition, type HierarchyFormDisplaySettings} from "./display/hierarchy";
import {RangeFieldDefinition, type RangeFormQuestionSettings} from "@perfice/model/form/display/range";
import {SegmentedFieldDefinition, type SegmentedFormQuestionSettings} from "@perfice/model/form/display/segmented";
import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {RichInputFieldDefinition, type RichInputFormQuestionSettings} from "@perfice/model/form/display/rich-input";
import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {TextAreaFieldDefinition, type TextAreaFormQuestionSettings} from "@perfice/model/form/display/text-area";

export type FormQuestionDisplaySettings =
    DisplayDef<FormQuestionDisplayType.INPUT, InputFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.SELECT, SelectFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.RANGE, RangeFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.HIERARCHY, HierarchyFormDisplaySettings>
    | DisplayDef<FormQuestionDisplayType.SEGMENTED, SegmentedFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.RICH_INPUT, RichInputFormQuestionSettings>
    | DisplayDef<FormQuestionDisplayType.TEXT_AREA, TextAreaFormQuestionSettings>

    ;


export type FormQuestionDisplaySettingsValue = InputFormQuestionSettings | SelectFormQuestionSettings |
    RangeFormQuestionSettings | HierarchyFormDisplaySettings | SegmentedFormQuestionSettings;

export type DisplayDef<K extends FormQuestionDisplayType, S extends object> = {
    displayType: K,
    displaySettings: S
}

export interface FormDisplayTypeDefinition<S> {
    // Returns null if the value is valid, otherwise returns an error message
    validate(value: PrimitiveValue): string | null;

    // Returns true if the value can be multiple values
    hasMultiple(s: S): boolean;

    getDefaultSettings(): S;

    getDisplayValue(value: PrimitiveValue, displaySettings: S, dataSettings: any): PrimitiveValue | null;

    // Allows the display settings to be changed when the data type changes
    onDataTypeChanged(s: S, dataType: string, primitiveType: PrimitiveValueType): S;

    getName(): string;

    getIcon(): IconDefinition;
}


export class FormQuestionDisplayTypeRegistry {
    private displayTypes: Map<string, FormDisplayTypeDefinition<any>> = new Map();

    registerField(type: string, field: FormDisplayTypeDefinition<any>) {
        this.displayTypes.set(type, field);
    }

    getFieldByType(type: string): FormDisplayTypeDefinition<any> | undefined {
        return this.displayTypes.get(type);
    }

    getRegisteredDisplayTypes(): [string, FormDisplayTypeDefinition<any>][] {
        return this.displayTypes.entries().toArray();
    }
}

export const questionDisplayTypeRegistry = new FormQuestionDisplayTypeRegistry();
questionDisplayTypeRegistry.registerField(FormQuestionDisplayType.SELECT, new SelectFieldDefinition());
questionDisplayTypeRegistry.registerField(FormQuestionDisplayType.INPUT, new InputFieldDefinition());
questionDisplayTypeRegistry.registerField(FormQuestionDisplayType.HIERARCHY, new HierarchyFieldDefinition());
questionDisplayTypeRegistry.registerField(FormQuestionDisplayType.SEGMENTED, new SegmentedFieldDefinition());
questionDisplayTypeRegistry.registerField(FormQuestionDisplayType.RANGE, new RangeFieldDefinition());
questionDisplayTypeRegistry.registerField(FormQuestionDisplayType.TEXT_AREA, new TextAreaFieldDefinition());
//questionDisplayTypeRegistry.registerField(FormQuestionDisplayType.RICH_INPUT, new RichInputFieldDefinition());
