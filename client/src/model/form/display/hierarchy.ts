import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import {comparePrimitives, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import type {HierarchyFormQuestionDataSettings} from "@perfice/model/form/data/hierarchy";
import {faCircleDot, faFolderTree, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface HierarchyFormDisplaySettings {
    onlyLeafOption: boolean;
}

export class HierarchyFieldDefinition implements FormDisplayTypeDefinition<HierarchyFormDisplaySettings> {
    validate(value: PrimitiveValue): string | null {
        return null;
    }

    hasMultiple(s: HierarchyFormDisplaySettings): boolean {
        return false;
    }

    getDefaultSettings(): HierarchyFormDisplaySettings {
        return {
            onlyLeafOption: true
        };
    }

    getDisplayValue(value: PrimitiveValue, displaySettings: HierarchyFormDisplaySettings, dataSettings: HierarchyFormQuestionDataSettings): PrimitiveValue {
        if (value.type != PrimitiveValueType.LIST) {
            return pString("");
        }

        let result = [];
        let root = dataSettings.root;
        for (let v of value.value) {
            let option = root.children.find(o => comparePrimitives(o.value, v));
            if (option == null) continue;

            result.push(option.text);
            root = option;
        }

        if (displaySettings.onlyLeafOption) {
            return pString(result.length > 0 ? result[result.length - 1] : "");
        } else {
            return pString(result.join(", "));
        }
    }

    onDataTypeChanged(s: HierarchyFormDisplaySettings, dataType: string): HierarchyFormDisplaySettings {
        return s;
    }


    getName(): string {
        return "Hierarchy";
    }

    getIcon(): IconDefinition {
        return faFolderTree;
    }

}
