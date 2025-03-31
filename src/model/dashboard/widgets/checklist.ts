import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {type Variable, type VariableTypeDef} from "@perfice/model/variable/variable";
import {
    type ChecklistWidgetSettings, createChecklistDependencies
} from "@perfice/model/sharedWidgets/checklist/checklist";

export interface DashboardChecklistWidgetSettings extends ChecklistWidgetSettings {
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
            conditions: []
        };
    }

    createDependencies(settings: DashboardChecklistWidgetSettings): Map<string, Variable> {
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

    updateDependencies(_dependencies: Record<string, string>, _previousSettings: DashboardChecklistWidgetSettings, settings: DashboardChecklistWidgetSettings): Map<string, VariableTypeDef> {
        return createChecklistDependencies(settings);
    }

}
