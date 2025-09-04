import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import {faBullseye, faTags, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DashboardTagsWidgetSettings {
    categories: string[];
}

export class DashboardTagsWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.TAGS, DashboardTagsWidgetSettings> {
    getType(): DashboardWidgetType.TAGS {
        return DashboardWidgetType.TAGS;
    }

    getName(): string {
        return "Tags";
    }

    getIcon(): IconDefinition {
        return faTags;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardTagsWidgetSettings {
        return {
            categories: []
        };
    }

    createDependencies(settings: DashboardTagsWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardTagsWidgetSettings, settings: DashboardTagsWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}
