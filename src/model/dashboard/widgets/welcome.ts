import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {type Variable, type VariableTypeDef} from "@perfice/model/variable/variable";
import {faSun, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DashboardWelcomeWidgetSettings {

}

export class DashboardWelcomeWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.WELCOME, DashboardWelcomeWidgetSettings> {
    getType(): DashboardWidgetType.WELCOME {
        return DashboardWidgetType.WELCOME;
    }

    getName(): string {
        return "Welcome";
    }

    getIcon(): IconDefinition {
        return faSun;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardWelcomeWidgetSettings {
        return {};
    }

    createDependencies(settings: DashboardWelcomeWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardWelcomeWidgetSettings, settings: DashboardWelcomeWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}
