import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {faCircleDot, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface SegmentedOption {
    id: string;
    value: PrimitiveValue;
    text: string;
}

export interface SegmentedFormQuestionSettings {
    options: SegmentedOption[];
}

export class SegmentedFieldDefinition implements FormDisplayTypeDefinition<SegmentedFormQuestionSettings> {
    validate(value: PrimitiveValue): string | null {
        return null;
    }

    hasMultiple(s: SegmentedFormQuestionSettings): boolean {
        return false;
    }

    getDefaultSettings(): SegmentedFormQuestionSettings {
        return {
            options: []
        };
    }

    getDisplayValue(value: PrimitiveValue, displaySettings: SegmentedFormQuestionSettings): PrimitiveValue | null {
        return null;
    }


    onDataTypeChanged(s: SegmentedFormQuestionSettings, dataType: string): SegmentedFormQuestionSettings {
        return s;
    }

    getName(): string {
        return "Segmented";
    }

    getIcon(): IconDefinition {
        return faCircleDot;
    }

}
