import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {type Variable, type VariableTypeDef} from "@perfice/model/variable/variable";

export interface DashboardMetricWidgetSettings {
    icon: string;
}

export class DashboardMetricWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.METRIC, DashboardMetricWidgetSettings> {
    getType(): DashboardWidgetType.METRIC {
        return DashboardWidgetType.METRIC;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardMetricWidgetSettings {
        return {
            icon: "moon"
        };
    }

    createDependencies(settings: DashboardMetricWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardMetricWidgetSettings, settings: DashboardMetricWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}
