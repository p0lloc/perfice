import {type Variable} from "@perfice/model/variable/variable";
import {
    DashboardEntryRowWidgetDefinition,
    type DashboardEntryRowWidgetSettings
} from "@perfice/model/dashboard/widgets/entryRow";
import {
    DashboardChartWidgetDefinition,
    type DashboardChartWidgetSettings
} from "@perfice/model/dashboard/widgets/chart";
import {
    DashboardWelcomeWidgetDefinition,
    type DashboardWelcomeWidgetSettings
} from "@perfice/model/dashboard/widgets/welcome";
import {
    DashboardTableWidgetDefinition,
    type DashboardTableWidgetSettings
} from "@perfice/model/dashboard/widgets/table";
import {DashboardGoalWidgetDefinition, type DashboardGoalWidgetSettings} from "@perfice/model/dashboard/widgets/goal";
import {DashboardTagsWidgetDefinition, type DashboardTagsWidgetSettings} from "@perfice/model/dashboard/widgets/tags";
import {
    DashboardMetricWidgetDefinition,
    type DashboardMetricWidgetSettings
} from "@perfice/model/dashboard/widgets/metric";
import {
    DashboardTrackableWidgetDefinition,
    type DashboardTrackableWidgetSettings
} from "@perfice/model/dashboard/widgets/trackable";
import {
    DashboardNewCorrelationsWidgetDefinition,
    type DashboardNewCorrelationsWidgetSettings
} from "@perfice/model/dashboard/widgets/newCorrelations";
import {
    DashboardInsightsWidgetDefinition,
    type DashboardInsightsWidgetSettings
} from "@perfice/model/dashboard/widgets/insights";
import {
    DashboardChecklistWidgetDefinition,
    type DashboardChecklistWidgetSettings
} from "@perfice/model/dashboard/widgets/checklist";
import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface Dashboard {
    id: string;
    name: string;
}

export interface DashboardWidgetDisplaySettings {
    x: number;
    y: number;
    width: number;
    height: number;
}

export enum DashboardWidgetType {
    ENTRY_ROW = "ENTRY_ROW",
    CHART = "CHART",
    WELCOME = "WELCOME",
    TABLE = "TABLE",
    GOAL = "GOAL",
    TAGS = "TAGS",
    METRIC = "METRIC",
    TRACKABLE = "TRACKABLE",
    NEW_CORRELATIONS = "NEW_CORRELATIONS",
    INSIGHTS = "INSIGHTS",
    CHECKLIST = "CHECKLIST",
}

export type DashboardWidget = {
    id: string;
    dashboardId: string;
    display: DashboardWidgetDisplaySettings;
    dependencies: Record<string, string>;
} & DashboardWidgetSettings;

export type DashboardWidgetSettings =
    DS<DashboardWidgetType.ENTRY_ROW, DashboardEntryRowWidgetSettings>
    | DS<DashboardWidgetType.CHART, DashboardChartWidgetSettings>
    | DS<DashboardWidgetType.WELCOME, DashboardWelcomeWidgetSettings>
    | DS<DashboardWidgetType.TABLE, DashboardTableWidgetSettings>
    | DS<DashboardWidgetType.GOAL, DashboardGoalWidgetSettings>
    | DS<DashboardWidgetType.TAGS, DashboardTagsWidgetSettings>
    | DS<DashboardWidgetType.METRIC, DashboardMetricWidgetSettings>
    | DS<DashboardWidgetType.TRACKABLE, DashboardTrackableWidgetSettings>
    | DS<DashboardWidgetType.NEW_CORRELATIONS, DashboardNewCorrelationsWidgetSettings>
    | DS<DashboardWidgetType.INSIGHTS, DashboardInsightsWidgetSettings>
    | DS<DashboardWidgetType.CHECKLIST, DashboardChecklistWidgetSettings>
    ;

export interface DS<T extends DashboardWidgetType, V> {
    type: T;
    settings: V;
}

export interface DashboardWidgetDefinition<T extends DashboardWidgetType, S> {
    getType(): T;

    getMinHeight(): number | undefined;

    getMinWidth(): number | undefined;

    getDefaultSettings(): S;

    // Creates the variables that this widget depends on
    createDependencies(settings: S, previousDependencies?: Record<string, string>): Map<string, Variable>;

    // // Returns the variable updates should occur when the settings change
    // updateDependencies(dependencies: Record<string, string>, previousSettings: S, updatedSettings: S): Map<string, VariableTypeDef>;

    getName(): string;

    getIcon(): IconDefinition;
}

const definitions: Map<DashboardWidgetType, DashboardWidgetDefinition<DashboardWidgetType, any>> = new Map();
definitions.set(DashboardWidgetType.ENTRY_ROW, new DashboardEntryRowWidgetDefinition());
definitions.set(DashboardWidgetType.CHART, new DashboardChartWidgetDefinition());
definitions.set(DashboardWidgetType.WELCOME, new DashboardWelcomeWidgetDefinition());
definitions.set(DashboardWidgetType.TABLE, new DashboardTableWidgetDefinition());
definitions.set(DashboardWidgetType.GOAL, new DashboardGoalWidgetDefinition());
definitions.set(DashboardWidgetType.TAGS, new DashboardTagsWidgetDefinition());
definitions.set(DashboardWidgetType.METRIC, new DashboardMetricWidgetDefinition());
definitions.set(DashboardWidgetType.TRACKABLE, new DashboardTrackableWidgetDefinition());
definitions.set(DashboardWidgetType.NEW_CORRELATIONS, new DashboardNewCorrelationsWidgetDefinition());
definitions.set(DashboardWidgetType.INSIGHTS, new DashboardInsightsWidgetDefinition());
definitions.set(DashboardWidgetType.CHECKLIST, new DashboardChecklistWidgetDefinition());

export function getDashboardWidgetDefinitions(): DashboardWidgetDefinition<DashboardWidgetType, any>[] {
    return Array.from(definitions.values());
}

export function getDashboardWidgetDefinition(type: DashboardWidgetType): DashboardWidgetDefinition<DashboardWidgetType, any> | undefined {
    return definitions.get(type);
}