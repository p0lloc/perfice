import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import {faBullseye, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DashboardGoalWidgetSettings {
    goalVariableId: string;
    goalStreakVariableId: string;
}

export class DashboardGoalWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.GOAL, DashboardGoalWidgetSettings> {
    getType(): DashboardWidgetType.GOAL {
        return DashboardWidgetType.GOAL;
    }

    getName(): string {
        return "Goal";
    }

    getIcon(): IconDefinition {
        return faBullseye;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardGoalWidgetSettings {
        return {
            goalVariableId: "",
            goalStreakVariableId: ""
        };
    }

    createDependencies(settings: DashboardGoalWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardGoalWidgetSettings, settings: DashboardGoalWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}