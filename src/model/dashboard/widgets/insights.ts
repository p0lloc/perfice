import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {faMagnifyingGlass, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DashboardInsightsWidgetSettings {
    timeScope: SimpleTimeScopeType;
}

export class DashboardInsightsWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.INSIGHTS, DashboardInsightsWidgetSettings> {
    getType(): DashboardWidgetType.INSIGHTS {
        return DashboardWidgetType.INSIGHTS;
    }


    getName(): string {
        return "Insights";
    }

    getIcon(): IconDefinition {
        return faMagnifyingGlass;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardInsightsWidgetSettings {
        return {
            timeScope: SimpleTimeScopeType.DAILY
        };
    }

    createDependencies(settings: DashboardInsightsWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardInsightsWidgetSettings, settings: DashboardInsightsWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}
