import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import {
    faSquarePlus,
    faSquarePollHorizontal,
    faSquarePollVertical,
    type IconDefinition
} from "@fortawesome/free-solid-svg-icons";

export interface DashboardNewCorrelationsWidgetSettings {
}

export class DashboardNewCorrelationsWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.NEW_CORRELATIONS, DashboardNewCorrelationsWidgetSettings> {
    getType(): DashboardWidgetType.NEW_CORRELATIONS {
        return DashboardWidgetType.NEW_CORRELATIONS;
    }

    getName(): string {
        return "New correlations";
    }

    getIcon(): IconDefinition {
        return faSquarePollVertical;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardNewCorrelationsWidgetSettings {
        return {};
    }

    createDependencies(settings: DashboardNewCorrelationsWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardNewCorrelationsWidgetSettings, settings: DashboardNewCorrelationsWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}
