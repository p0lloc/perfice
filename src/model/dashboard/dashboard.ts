import {type Variable, type VariableTypeDef} from "@perfice/model/variable/variable";
import {
    DashboardEntryRowWidgetDefinition,
    type DashboardEntryRowWidgetSettings
} from "@perfice/model/dashboard/widgets/entryRow";
import {
    DashboardChartWidgetDefinition,
    type DashboardChartWidgetSettings
} from "@perfice/model/dashboard/widgets/chart";

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
}

export type DashboardWidget = {
    id: string;
    dashboardId: string;
    display: DashboardWidgetDisplaySettings;
    dependencies: Record<string, string>;
} & DashboardWidgetSettings;

export type DashboardWidgetSettings =
    DS<DashboardWidgetType.ENTRY_ROW, DashboardEntryRowWidgetSettings>
    | DS<DashboardWidgetType.CHART, DashboardChartWidgetSettings>;

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
    createDependencies(settings: S): Map<string, Variable>;

    // Returns the variable updates should occur when the settings change
    updateDependencies(dependencies: Record<string, string>, previousSettings: S, updatedSettings: S): Map<string, VariableTypeDef>;
}

const definitions: Map<DashboardWidgetType, DashboardWidgetDefinition<DashboardWidgetType, any>> = new Map();
definitions.set(DashboardWidgetType.ENTRY_ROW, new DashboardEntryRowWidgetDefinition());
definitions.set(DashboardWidgetType.CHART, new DashboardChartWidgetDefinition());

export function getDashboardWidgetDefinitions(): DashboardWidgetDefinition<DashboardWidgetType, any>[] {
    return Array.from(definitions.values());
}

export function getDashboardWidgetDefinition(type: DashboardWidgetType): DashboardWidgetDefinition<DashboardWidgetType, any> | undefined {
    return definitions.get(type);
}