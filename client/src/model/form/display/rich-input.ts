import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {faFont, faRulerHorizontal, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface RichInputFormQuestionSettings {
}

export class RichInputFieldDefinition implements FormDisplayTypeDefinition<RichInputFormQuestionSettings> {
    validate(value: PrimitiveValue): string | null {
        return null;
    }

    hasMultiple(s: RichInputFormQuestionSettings): boolean {
        return false;
    }

    getDefaultSettings(): RichInputFormQuestionSettings {
        return {};
    }

    getDisplayValue(value: PrimitiveValue, displaySettings: RichInputFormQuestionSettings): PrimitiveValue | null {
        return null;
    }

    onDataTypeChanged(s: RichInputFormQuestionSettings, dataType: string): RichInputFormQuestionSettings {
        return s;
    }

    getName(): string {
        return "Rich input";
    }

    getIcon(): IconDefinition {
        return faFont;
    }

}
