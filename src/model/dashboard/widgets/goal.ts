import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";

export interface DashboardGoalWidgetSettings {
    goalVariableId: string;
}

export class DashboardGoalWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.GOAL, DashboardGoalWidgetSettings> {
    getType(): DashboardWidgetType.GOAL {
        return DashboardWidgetType.GOAL;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardGoalWidgetSettings {
        return {
            goalVariableId: ""
        };
    }

    createDependencies(settings: DashboardGoalWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardGoalWidgetSettings, settings: DashboardGoalWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}