import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pList, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "../form";

export interface HierarchyOption {
    id: string;
    value: PrimitiveValue;
    text: string;
    color: string;
    children: HierarchyOption[];
}

export interface HierarchyFormQuestionDataSettings {
    root: HierarchyOption;
}

export class HierarchyFormQuestionDataType implements FormQuestionDataTypeDefinition<PrimitiveValue[], HierarchyFormQuestionDataSettings> {
    validate(value: PrimitiveValue[], settings: HierarchyFormQuestionDataSettings): string | null {
        return null;
    }

    getDefaultSettings(): HierarchyFormQuestionDataSettings {
        return {
            root: {
                id: "root",
                value: pString("root"),
                text: "",
                color: "#ff0000",
                children: [
                    {
                        id: "high_unpleasant",
                        value: pString("high_unpleasant"),
                        text: "High energy\nUnpleasant",
                        color: "#FFA9A9",
                        children: []
                    },

                    {
                        id: "high_pleasant",
                        value: pString("high_pleasant"),
                        text: "High energy\nPleasant",
                        color: "#F5FFA9",
                        children: []
                    },

                    {
                        id: "low_unpleasant",
                        value: pString("low_unpleasant"),
                        text: "Low energy\nUnpleasant",
                        color: "#A9AAFF",
                        children: [
                            {
                                id: "depressed",
                                value: pString("Depressed"),
                                text: "Depressed",
                                color: "#A9AAFF",
                                children: []
                            },
                        ]
                    },
                    {
                        id: "low_pleasant",
                        value: pString("low_pleasant"),
                        text: "Low energy\nPleasant",
                        color: "#C0FFA9",
                        children: [
                            {
                                id: "grateful",
                                value: pString("Grateful"),
                                text: "Grateful",
                                color: "#C0FFA9",
                                children: []
                            },

                            {
                                id: "content",
                                value: pString("Content"),
                                text: "Content",
                                color: "#C0FFA9",
                                children: []
                            }
                        ]
                    }
                ]
            }
        };
    }

    getDefaultValue(settings: HierarchyFormQuestionDataSettings): PrimitiveValue[] {
        return [
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
