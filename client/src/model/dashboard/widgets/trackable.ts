import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import {faHashtag, faSquarePlus, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DashboardTrackableWidgetSettings {
    trackableId: string;
}

export class DashboardTrackableWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.TRACKABLE, DashboardTrackableWidgetSettings> {
    getType(): DashboardWidgetType.TRACKABLE {
        return DashboardWidgetType.TRACKABLE;
    }

    getName(): string {
        return "Trackable";
    }

    getIcon(): IconDefinition {
        return faSquarePlus;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardTrackableWidgetSettings {
        return {
            trackableId: ""
        };
    }

    createDependencies(settings: DashboardTrackableWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardTrackableWidgetSettings, settings: DashboardTrackableWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}
