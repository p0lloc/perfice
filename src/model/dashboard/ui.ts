import type {Dashboard, DashboardWidget, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import type {Form} from "@perfice/model/form/form";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import type {ContextMenuButton} from "@perfice/model/ui/context-menu";
import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";

export const CURRENT_DASHBOARD_KEY = "currentDashboard";

export enum DashboardSidebarActionType {
    ADD_WIDGET,
    EDIT_WIDGET
}

export type DashboardSidebarAction =
    SA<DashboardSidebarActionType.ADD_WIDGET, DashboardAddWidgetAction>
    | SA<DashboardSidebarActionType.EDIT_WIDGET, DashboardEditWidgetAction>;

export interface DashboardAddWidgetAction {
    onClick: (definition: DashboardWidgetType, disableEdit: boolean) => void;
}

export interface DashboardEditWidgetAction {
    widget: DashboardWidget;
    forms: Form[];
    onChange: (widget: DashboardWidget) => void;
    onDelete: () => void;
}

export interface SA<T extends DashboardSidebarActionType, V> {
    type: T;
    value: V;
}

export interface DashboardWidgetRendererExports {
    onWidgetUpdated: (widget: DashboardWidget) => void;
}

export function popupButtonsForDashboards(values: Dashboard[], action: (value: string) => void): ContextMenuButton[] {
    return [...values.map(v => {
        return {
            name: v.name,
            icon: null,
            action: () => action(v.id)
        }
    }),
        {
            name: "Create new",
            icon: faPlus,
            separated: true,
            action: () => action("create"),
        },
    ];
}

export function dropdownButtonsForDashboards(values: Dashboard[]): DropdownMenuItem<string>[] {
    return [...values.map(v => {
        return {
            value: v.id,
            name: v.name
        }
    }),
        {
            value: "create",
            name: "Create new",
            icon: faPlus, separated: true
        }
    ];
}