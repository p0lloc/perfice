import type {
    DashboardWidget,
    DashboardWidgetDisplaySettings,
    DashboardWidgetType
} from "@perfice/model/dashboard/dashboard";
import type {Form} from "@perfice/model/form/form";

export interface DashboardWidgetAddEvent {
    type: DashboardWidgetType;
    display: DashboardWidgetDisplaySettings;
}

export enum DashboardSidebarActionType {
    ADD_WIDGET,
    EDIT_WIDGET
}

export type DashboardSidebarAction =
    SA<DashboardSidebarActionType.ADD_WIDGET, DashboardAddWidgetAction>
    | SA<DashboardSidebarActionType.EDIT_WIDGET, DashboardEditWidgetAction>;

export interface DashboardAddWidgetAction {
}

export interface DashboardEditWidgetAction {
    widget: DashboardWidget;
    forms: Form[];
    onChange: (widget: DashboardWidget) => void;
}

export interface SA<T extends DashboardSidebarActionType, V> {
    type: T;
    value: V;
}

export interface DashboardWidgetRendererExports {
    onWidgetUpdated: (widget: DashboardWidget) => void;
}
