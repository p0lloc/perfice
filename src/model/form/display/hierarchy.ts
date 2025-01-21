import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import type { PrimitiveValue } from "@perfice/model/primitive/primitive";

export interface HierarchyFormQuestionSettings {
}

export class HierarchyFieldDefinition implements FormDisplayTypeDefinition<HierarchyFormQuestionSettings> {
    validate(value: PrimitiveValue): string | null {
        return null;
    }
    hasMultiple(s: HierarchyFormQuestionSettings): boolean {
        return false;
    }
    getDefaultSettings(): HierarchyFormQuestionSettings {
        return {};
    }
    getDisplayValue(value: PrimitiveValue, displaySettings: HierarchyFormQuestionSettings): PrimitiveValue {
        return value;
    }
}
