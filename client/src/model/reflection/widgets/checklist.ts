import {
    type ReflectionWidgetAnswerState,
    type ReflectionWidgetDefinition,
    ReflectionWidgetType,
} from "@perfice/model/reflection/reflection";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import {
    type ChecklistWidgetSettings,
    createChecklistDependencies
} from "@perfice/model/sharedWidgets/checklist/checklist";
import type {ChecklistData} from "@perfice/stores/sharedWidgets/checklist/checklist";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";

export interface ReflectionChecklistWidgetSettings extends ChecklistWidgetSettings {
}

export interface ReflectionChecklistWidgetAnswerState {
    data: ChecklistData[];
}

export class ReflectionChecklistWidgetDefinition implements ReflectionWidgetDefinition<ReflectionWidgetType.CHECKLIST, ReflectionChecklistWidgetSettings> {
    getType(): ReflectionWidgetType.CHECKLIST {
        return ReflectionWidgetType.CHECKLIST;
    }

    getDefaultSettings(): ReflectionChecklistWidgetSettings {
        return {
            conditions: [],
            timeScope: SimpleTimeScopeType.DAILY
        };
    }

    createDependencies(settings: ReflectionChecklistWidgetSettings): Map<string, Variable> {
        let map: Map<string, Variable> = new Map();
        let typeDefs = createChecklistDependencies(settings);
        for (let [key, value] of typeDefs) {
            map.set(key, {
                id: crypto.randomUUID(),
                name: "Checklist",
                type: value
            });
        }

        return map;
    }

    updateDependencies(dependencies: Record<string, string>,
                       previousSettings: ReflectionChecklistWidgetSettings, settings: ReflectionChecklistWidgetSettings): Map<string, VariableTypeDef> {

        return createChecklistDependencies(settings);
    }

    createAnswerState(): ReflectionWidgetAnswerState {
        return {
            type: ReflectionWidgetType.CHECKLIST,
            state: {
                data: []
            }
        };
    }

}