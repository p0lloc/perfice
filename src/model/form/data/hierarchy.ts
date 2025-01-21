import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pList, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "../form";

export interface HierarchyOption {
    id: string;
    value: PrimitiveValue;
    children: HierarchyOption[];
}

export interface HierarchyFormQuestionDataSettings {
    root: HierarchyOption;
}

export class HierarchyFormQuestionDataType implements FormQuestionDataTypeDefinition<string[], HierarchyFormQuestionDataSettings> {
    validate(value: string[], settings: HierarchyFormQuestionDataSettings): string | null {
        return null;
    }

    getDefaultSettings(): HierarchyFormQuestionDataSettings {
        return {
            root: {
                id: "root",
                value: pString("root"),
                children: []
            }
        };
    }

    getDefaultValue(settings: HierarchyFormQuestionDataSettings): string[] {
        return [
            settings.root.id
        ]
    }

    getPrimitiveType(): PrimitiveValueType {
        return PrimitiveValueType.LIST;
    }

    serialize(value: PrimitiveValue) : string[] {
        if(value.type == PrimitiveValueType.LIST) {
            let res = [];
            for(let v of value.value) {
                if(v.type == PrimitiveValueType.STRING) {
                    res.push(v.value);
                }
            }

            return res;
        }

        return [];
    }

    deserialize(value: string[]): PrimitiveValue | null {
        return pList(value.map(v => pString(v)));
    }

    getSupportedDisplayTypes(): FormQuestionDisplayType[] {
        return [FormQuestionDisplayType.HIERARCHY];
    }

}
