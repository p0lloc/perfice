import {faKeyboard, faParagraph, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import {type PrimitiveValue} from "@perfice/model/primitive/primitive";

export interface TextAreaFormQuestionSettings {
}

export class TextAreaFieldDefinition implements FormDisplayTypeDefinition<TextAreaFormQuestionSettings> {
    getDisplayValue(value: PrimitiveValue, displaySettings: TextAreaFormQuestionSettings): PrimitiveValue | null {
        return null;
    }

    hasMultiple(_s: TextAreaFormQuestionSettings): boolean {
        return false;
    }

    validate(): string | null {
        return null;
    }

    getDefaultSettings(): TextAreaFormQuestionSettings {
        return {};
    }

    onDataTypeChanged(s: TextAreaFormQuestionSettings, dataType: string): TextAreaFormQuestionSettings {
        return s;
    }

    getName(): string {
        return "Text area";
    }

    getIcon(): IconDefinition {
        return faParagraph;
    }
}
