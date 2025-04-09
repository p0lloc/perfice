import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pList, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "../form";
import {type ExportedPrimitive, exportPrimitive, importPrimitive} from "@perfice/services/export/export";
import {faFolderTree, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface HierarchyOption {
    id: string;
    value: PrimitiveValue;
    text: string;
    color: string;
    gridSize: number;
    children: HierarchyOption[];
}

export interface HierarchyFormQuestionDataSettings {
    root: HierarchyOption;
}

export const HIERARCHY_ROOT_ID = "root";

export class HierarchyFormQuestionDataType implements FormQuestionDataTypeDefinition<PrimitiveValue[], HierarchyFormQuestionDataSettings> {
    validate(value: PrimitiveValue[], settings: HierarchyFormQuestionDataSettings): string | null {
        return null;
    }

    getDefaultSettings(): HierarchyFormQuestionDataSettings {
        return {
            root: {
                id: HIERARCHY_ROOT_ID,
                value: pString("root"),
                text: "",
                color: "#ff0000",
                gridSize: 2,
                children: [
                    {
                        id: "high_unpleasant",
                        value: pString("high_unpleasant"),
                        text: "High energy\nUnpleasant",
                        color: "#FFA9A9",
                        children: [],
                        gridSize: 2,
                    },

                    {
                        id: "high_pleasant",
                        value: pString("high_pleasant"),
                        text: "High energy\nPleasant",
                        color: "#F5FFA9",
                        children: [],
                        gridSize: 2,
                    },

                    {
                        id: "low_unpleasant",
                        value: pString("low_unpleasant"),
                        text: "Low energy\nUnpleasant",
                        color: "#A9AAFF",
                        gridSize: 2,
                        children: [
                            {
                                id: "depressed",
                                value: pString("Depressed"),
                                text: "Depressed",
                                color: "#A9AAFF",
                                children: [],
                                gridSize: 2,
                            },
                        ]
                    },
                    {
                        id: "low_pleasant",
                        value: pString("low_pleasant"),
                        text: "Low energy\nPleasant",
                        color: "#C0FFA9",
                        gridSize: 2,
                        children: [
                            {
                                id: "grateful",
                                value: pString("Grateful"),
                                text: "Grateful",
                                color: "#C0FFA9",
                                gridSize: 2,
                                children: []
                            },

                            {
                                id: "content",
                                value: pString("Content"),
                                text: "Content",
                                color: "#C0FFA9",
                                gridSize: 2,
                                children: []
                            }
                        ]
                    }
                ]
            }
        };
    }

    getName(): string {
        return "Hierarchy";
    }

    getIcon(): IconDefinition {
        return faFolderTree;
    }

    getDefaultValue(settings: HierarchyFormQuestionDataSettings): PrimitiveValue[] {
        return []
    }

    getPrimitiveType(): PrimitiveValueType {
        return PrimitiveValueType.LIST;
    }

    serialize(value: PrimitiveValue): PrimitiveValue[] {
        if (value.type == PrimitiveValueType.LIST) {
            return value.value;
        }

        return [];
    }

    deserialize(value: PrimitiveValue[]): PrimitiveValue | null {
        return pList(value);
    }

    getSupportedDisplayTypes(): FormQuestionDisplayType[] {
        return [FormQuestionDisplayType.HIERARCHY];
    }

    export(value: PrimitiveValue): ExportedPrimitive | null {
        if (value.type != PrimitiveValueType.LIST) return null;
        return value.value.map(v => exportPrimitive(v));
    }

    import(value: ExportedPrimitive): PrimitiveValue | null {
        if (!Array.isArray(value)) return pList([]);

        return pList(value.map(v => importPrimitive(v)));
    }

    getDisplayValue(value: PrimitiveValue[]): PrimitiveValue | null {
        // Handled by display type
        return null;
    }

}
