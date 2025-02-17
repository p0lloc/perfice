import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import {
    PrimitiveValueType,
    pString,
    type PrimitiveValue,
    comparePrimitives
} from "@perfice/model/primitive/primitive";
import type {HierarchyFormQuestionDataSettings} from "@perfice/model/form/data/hierarchy";

export interface HierarchyFormDisplaySettings {
}

export class HierarchyFieldDefinition implements FormDisplayTypeDefinition<HierarchyFormDisplaySettings> {
    validate(value: PrimitiveValue): string | null {
        return null;
    }
    hasMultiple(s: HierarchyFormDisplaySettings): boolean {
        return false;
    }
    getDefaultSettings(): HierarchyFormDisplaySettings {
        return {};
    }

    getDisplayValue(value: PrimitiveValue, displaySettings: HierarchyFormQuestionDataSettings, dataSettings: HierarchyFormQuestionDataSettings): PrimitiveValue {
        if (value.type != PrimitiveValueType.LIST) {
            return pString("");
        }

        let result = [];
        let root = dataSettings.root;
        for(let v of value.value){
            let option = root.children.find(o => comparePrimitives(o.value, v));
            if(option == null) continue;

            result.push(option.text);
            root = option;
        }

        return pString(false ? result.join(", ") : (result.length > 0 ? result[result.length - 1] : ""));
    }

    onDataTypeChanged(s: HierarchyFormDisplaySettings, dataType: string): HierarchyFormDisplaySettings {
        return s;
    }
}
