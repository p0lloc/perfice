import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {faSun, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {type Variable, type VariableTypeDef} from "@perfice/model/variable/variable";


export interface DashboardReflectionsWidgetSettings {
}

export class DashboardReflectionsWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.REFLECTIONS, DashboardReflectionsWidgetSettings> {
    getType(): DashboardWidgetType.REFLECTIONS {
        return DashboardWidgetType.REFLECTIONS;
    }

    getName(): string {
        return "Reflections";
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

    getDefaultSettings(): DashboardReflectionsWidgetSettings {
        return {};
    }

    createDependencies(settings: DashboardReflectionsWidgetSettings, dependencies?: Record<string, string>): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardReflectionsWidgetSettings, settings: DashboardReflectionsWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}