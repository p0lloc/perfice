import {faQuestionCircle, faTags} from "@fortawesome/free-solid-svg-icons";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {TagVariableType} from "@perfice/services/variable/types/tag";
import type {SimpleTimeScopeType} from "@perfice/model/variable/time/time";

export interface ChecklistWidgetSettings {
    conditions: ChecklistCondition[];
    timeScope: SimpleTimeScopeType;
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

export function createChecklistDependencies(settings: ChecklistWidgetSettings): Map<string, VariableTypeDef> {
    let map: Map<string, VariableTypeDef> = new Map();
    for (let condition of settings.conditions) {
        switch (condition.value.type) {
            case ChecklistConditionType.FORM: {
                let formId = condition.value.value.formId;
                let existing = map.get(formId);
                let fields = Object.keys(condition.value.value.answers);
                if (existing != undefined && existing.type == VariableTypeName.LIST) {
                    let newFields = Object.fromEntries(fields.map(v => [v, false]));
                    existing.value = new ListVariableType(formId,
                        {...existing.value.getFields(), ...newFields}, []);
                } else {
                    map.set(condition.value.value.formId, {
                        type: VariableTypeName.LIST,
                        value: new ListVariableType(formId, Object.fromEntries(fields.map(v => [v, false])), [])
                    })
                }
                break;
            }
            case ChecklistConditionType.TAG: {
                map.set(condition.value.value.tagId, {
                    type: VariableTypeName.TAG,
                    value: new TagVariableType(condition.value.value.tagId)
                })
                break;
            }
        }
    }

    return map;
}
