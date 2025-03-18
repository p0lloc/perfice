import {type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";

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
    dependencies: Record<string, string>;
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

    getDefaultSettings(): S;

    // Creates the variables that this widget depends on
    createDependencies(settings: S): Map<string, VariableTypeDef>;

    // Returns the variable updates should occur when the settings change
    updateDependencies(previousSettings: S, updatedSettings: S): Map<string, VariableTypeDef>;
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

    createDependencies(settings: DashboardEntryRowWidgetSettings): Map<string, VariableTypeDef> {
        return new Map([["list", {
            type: VariableTypeName.LIST,
            value: new ListVariableType(settings.formId, {[settings.questionId]: true}, [])
        }]]);
    }

    updateDependencies(previousSettings: DashboardEntryRowWidgetSettings, settings: DashboardEntryRowWidgetSettings): Map<string, VariableTypeDef> {
        // No settings changed, return empty map
        if (previousSettings.formId == settings.formId
            && previousSettings.questionId == settings.questionId) return new Map();

        return this.createDependencies(settings);
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