import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

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
    getDisplayValue(value: PrimitiveValue, displaySettings: SegmentedFormQuestionSettings): PrimitiveValue {
        return value;
    }


    onDataTypeChanged(s: SegmentedFormQuestionSettings, dataType: string): SegmentedFormQuestionSettings {
        return s;
    }

}
