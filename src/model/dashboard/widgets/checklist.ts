import {pNumber, type PrimitiveValue, pString} from "@perfice/model/primitive/primitive";
import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {type Variable, type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {TagVariableType} from "@perfice/services/variable/types/tag";
import {faQuestionCircle, faTags} from "@fortawesome/free-solid-svg-icons";

export interface DashboardChecklistWidgetSettings {
    conditions: ChecklistCondition[];
}

export enum ChecklistConditionType {
    FORM = "FORM",
    TAG = "TAG",
}

export const CHECKLIST_CONDITION_TYPES = [{
    name: "Form",
    value: ChecklistConditionType.FORM,
    icon: faQuestionCircle
}, {
    name: "Tag",
    value: ChecklistConditionType.TAG,
    icon: faTags
}];

export interface ChecklistCondition {
    id: string;
    name: string;
    value: ChecklistConditionValue;
}

export type ChecklistConditionValue =
    CC<ChecklistConditionType.FORM, ChecklistFormCondition>
    | CC<ChecklistConditionType.TAG, ChecklistTagCondition>;

export interface ChecklistFormCondition {
    formId: string;
    answers: Record<string, PrimitiveValue>;
}

export interface ChecklistTagCondition {
    tagId: string;
}

export interface CC<T extends ChecklistConditionType, V> {
    type: T;
    value: V;
}


export class DashboardChecklistWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.CHECKLIST, DashboardChecklistWidgetSettings> {
    getType(): DashboardWidgetType.CHECKLIST {
        return DashboardWidgetType.CHECKLIST;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardChecklistWidgetSettings {
        return {
            conditions: [
                {
                    id: crypto.randomUUID(),
                    name: "Medicine 1",
                    value: {
                        type: ChecklistConditionType.FORM,
                        value: {
                            formId: "daea9b52-7e17-443b-88e5-6f37ba9b8b79",
                            answers: {
                                "9c97ad5a-5f3e-4e05-9968-b33cb27a1b17": pString("Medicine 1"),
                                "8263d891-96f0-43cf-8cd1-45a13410f48c": pNumber(100.0)
                            }
                        }
                    }
                },

                {
                    id: crypto.randomUUID(),
                    name: "Medicine 2",
                    value: {
                        type: ChecklistConditionType.FORM,
                        value: {
                            formId: "daea9b52-7e17-443b-88e5-6f37ba9b8b79",
                            answers: {
                                "9c97ad5a-5f3e-4e05-9968-b33cb27a1b17": pString("Medicine 2"),
                                "8263d891-96f0-43cf-8cd1-45a13410f48c": pNumber(200.0)
                            }
                        }
                    }
                },
                {
                    id: crypto.randomUUID(),
                    name: "Sleepy",
                    value: {
                        type: ChecklistConditionType.TAG,
                        value: {
                            tagId: "c7ad544e-148a-4e2c-8249-0d1d447c5425"
                        }
                    }
                }
            ]
        };
    }

    createDependencies(settings: DashboardChecklistWidgetSettings): Map<string, Variable> {
        let map: Map<string, Variable> = new Map();
        for (let condition of settings.conditions) {
            switch (condition.value.type) {
                case ChecklistConditionType.FORM: {
                    let formId = condition.value.value.formId;
                    let existing = map.get(formId);
                    let fields = Object.keys(condition.value.value.answers);
                    if (existing != undefined && existing.type.type == VariableTypeName.LIST) {
                        let newFields = Object.fromEntries(fields.map(v => [v, false]));
                        existing.type.value = new ListVariableType(formId,
                            {...existing.type.value.getFields(), ...newFields}, []);
                    } else {
                        map.set(condition.value.value.formId, {
                            id: crypto.randomUUID(),
                            name: "Form",
                            type: {
                                type: VariableTypeName.LIST,
                                value: new ListVariableType(formId, Object.fromEntries(fields.map(v => [v, false])), [])
                            }
                        })
                    }
                    break;
                }
                case ChecklistConditionType.TAG: {
                    map.set(condition.value.value.tagId, {
                        id: crypto.randomUUID(),
                        name: "Tag",
                        type: {
                            type: VariableTypeName.TAG,
                            value: new TagVariableType(condition.value.value.tagId)
                        }
                    })
                    break;
                }
            }
        }

        return map;
    }

    updateDependencies(_dependencies: Record<string, string>, _previousSettings: DashboardChecklistWidgetSettings, settings: DashboardChecklistWidgetSettings): Map<string, VariableTypeDef> {
        return new Map(this.createDependencies(settings)
            .entries()
            .map(([key, value]) =>
                [key, value.type]));
    }

}
