import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import type { PrimitiveValue } from "@perfice/model/primitive/primitive";

export interface InputFormQuestionSettings {}

export class InputFieldDefinition implements FormDisplayTypeDefinition<InputFormQuestionSettings> {
    getDisplayValue(value: PrimitiveValue, displaySettings: InputFormQuestionSettings): PrimitiveValue {
        return value;
    }

    hasMultiple(_s: InputFormQuestionSettings): boolean {
        return false;
    }

    validate(): string | null {
        return null;
    }

    getDefaultSettings(): InputFormQuestionSettings {
        return {};
    }

    onDataTypeChanged(s: InputFormQuestionSettings, dataType: string): InputFormQuestionSettings {
        return s;
    }
}
