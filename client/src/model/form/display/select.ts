import {
    prettyPrintPrimitive,
    primitiveAsType,
    type PrimitiveValue,
    PrimitiveValueType,
    pString
} from "@perfice/model/primitive/primitive";
import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import {faBorderAll, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
import type {FormQuestionDataType} from "@perfice/model/form/form";

export interface SelectOption {
    id: string;
    text: string;
    value: PrimitiveValue;
    icon: string | null;
    iconAndText: boolean;
}

export interface SelectGrid {
    itemsPerRow: number;
    border: boolean;
}

export interface SelectFormQuestionSettings {
    options: SelectOption[];
    // If user should be able to select multiple options
    multiple: boolean;
    grid: SelectGrid | null;
}

export class SelectFieldDefinition implements FormDisplayTypeDefinition<SelectFormQuestionSettings> {
    getDisplayValue(value: PrimitiveValue, displaySettings: SelectFormQuestionSettings): PrimitiveValue {
        if (value.type == PrimitiveValueType.LIST) {
            // TODO: format the value
            return pString(value.value.map(v =>
                prettyPrintPrimitive(this.getDisplayValue(v, displaySettings))).join(", "));
        }

        let option = displaySettings.options.find(o => o.value.value == value.value);
        if (option == null) return pString("");

        return pString(option.text);
    }

    hasMultiple(s: SelectFormQuestionSettings): boolean {
        return s.multiple;
    }

    validate(): string | null {
        return null;
    }

    getDefaultSettings(): SelectFormQuestionSettings {
        return {options: [], grid: null, multiple: false};
    }

    onDataTypeChanged(s: SelectFormQuestionSettings, dataType: FormQuestionDataType, primitiveType: PrimitiveValueType): SelectFormQuestionSettings {
        return {
            ...s,
            options: s.options.map(o => {
                return {...o, value: primitiveAsType(o.value, primitiveType)}
            })
        };
    }

    getName(): string {
        return "Select";
    }

    getIcon(): IconDefinition {
        return faBorderAll;
    }
}
