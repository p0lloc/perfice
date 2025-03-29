import type {ChecklistCondition} from "@perfice/model/dashboard/widgets/checklist";
import {
    type ReflectionWidgetDefinition,
    ReflectionWidgetType,
} from "@perfice/model/reflection/reflection";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";

export interface ReflectionChecklistWidgetSettings {
    conditions: ChecklistCondition[];
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
}