import type {ChecklistCondition} from "@perfice/model/dashboard/widgets/checklist";
import {
    type ReflectionWidgetAnswerState,
    type ReflectionWidgetDefinition,
    ReflectionWidgetType,
} from "@perfice/model/reflection/reflection";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export interface ReflectionChecklistWidgetSettings {
    conditions: ChecklistCondition[];
}


export interface ReflectionChecklistWidgetAnswerState {
}

export class ReflectionChecklistWidgetDefinition implements ReflectionWidgetDefinition<ReflectionWidgetType.CHECKLIST, ReflectionChecklistWidgetSettings> {
    getType(): ReflectionWidgetType.CHECKLIST {
        return ReflectionWidgetType.CHECKLIST;
    }

    getDefaultSettings(): ReflectionChecklistWidgetSettings {
        return {
            conditions: []
        };
    }

    createDependencies(settings: ReflectionChecklistWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>,
                       previousSettings: ReflectionChecklistWidgetSettings, settings: ReflectionChecklistWidgetSettings): Map<string, VariableTypeDef> {

        return new Map();
    }

    createAnswerState(): ReflectionWidgetAnswerState {
        return {
            type: ReflectionWidgetType.CHECKLIST,
            state: {}
        };
    }

}