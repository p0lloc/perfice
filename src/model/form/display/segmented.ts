import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export interface SegmentedFormQuestionSettings {}
export class SegmentedFieldDefinition implements FormDisplayTypeDefinition<SegmentedFormQuestionSettings> {
    validate(value: PrimitiveValue): string | null {
        return null;
    }
    hasMultiple(s: SegmentedFormQuestionSettings): boolean {
        return false;
    }
    getDefaultSettings(): SegmentedFormQuestionSettings {
        return {};
    }
    getDisplayValue(value: PrimitiveValue, displaySettings: SegmentedFormQuestionSettings): PrimitiveValue {
        return value;
    }


    onDataTypeChanged(s: SegmentedFormQuestionSettings, dataType: string): SegmentedFormQuestionSettings {
        return s;
    }

}
