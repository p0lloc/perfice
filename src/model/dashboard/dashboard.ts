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
}

export type DashboardWidget = {
    id: string;
    dashboardId: string;
    display: DashboardWidgetDisplaySettings;
} & DashboardWidgetSettings;

export type DashboardWidgetSettings = DS<DashboardWidgetType.ENTRY_ROW, DashboardEntryRowWidgetSettings>;

export interface DS<T extends DashboardWidgetType, V> {
    type: T;
    settings: V;
}

export interface DashboardEntryRowWidgetSettings {
    formId: string;
    questionId: string;
}

export interface DashboardWidgetDefinition<T extends DashboardWidgetType, S> {
    getType(): T;

    getMinHeight(): number | undefined;

    getMinWidth(): number | undefined;

    getDefaultSettings(): S
}

export class DashboardEntryRowWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.ENTRY_ROW, DashboardEntryRowWidgetSettings> {
    getType(): DashboardWidgetType.ENTRY_ROW {
        return DashboardWidgetType.ENTRY_ROW;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardEntryRowWidgetSettings {
        return {
            formId: "abc",
            questionId: "",
        };
    }
}

const definitions: Map<DashboardWidgetType, DashboardWidgetDefinition<DashboardWidgetType, any>> = new Map();
definitions.set(DashboardWidgetType.ENTRY_ROW, new DashboardEntryRowWidgetDefinition());

export function getDashboardWidgetDefinitions(): DashboardWidgetDefinition<DashboardWidgetType, any>[] {
    return Array.from(definitions.values());
}

export function getDashboardWidgetDefinition(type: DashboardWidgetType): DashboardWidgetDefinition<DashboardWidgetType, any> | undefined {
    return definitions.get(type);
}