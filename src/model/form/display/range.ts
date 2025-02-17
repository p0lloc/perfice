import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {HierarchyFormDisplaySettings} from "@perfice/model/form/display/hierarchy";

export interface RangeFormQuestionSettings {}

export class RangeFieldDefinition implements FormDisplayTypeDefinition<RangeFormQuestionSettings> {
    validate(value: PrimitiveValue): string | null {
        return null;
    }
    hasMultiple(s: RangeFormQuestionSettings): boolean {
        return false;
    }
    getDefaultSettings(): RangeFormQuestionSettings {
        return {};
    }
    getDisplayValue(value: PrimitiveValue, displaySettings: RangeFormQuestionSettings): PrimitiveValue {
        return value;
    }

    onDataTypeChanged(s: RangeFormQuestionSettings, dataType: string): RangeFormQuestionSettings {
        return s;
    }

}
