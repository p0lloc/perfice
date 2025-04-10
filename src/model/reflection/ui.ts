import {type ReflectionPage, type ReflectionWidget, ReflectionWidgetType} from "@perfice/model/reflection/reflection";
import {faListOl, faQuestion, faTable, faTags} from "@fortawesome/free-solid-svg-icons";
import type {Form} from "@perfice/model/form/form";

export const NEW_REFLECTION_ROUTE = "new";

export const REFLECTION_WIDGET_TYPES = [
    {name: "Form", value: ReflectionWidgetType.FORM, icon: faQuestion},
    {name: "Tags", value: ReflectionWidgetType.TAGS, icon: faTags},
    {name: "Table", value: ReflectionWidgetType.TABLE, icon: faTable},
    {name: "Checklist", value: ReflectionWidgetType.CHECKLIST, icon: faListOl},
];

export enum ReflectionSidebarActionType {
    EDIT_PAGE,
    EDIT_WIDGET,
}

export type ReflectionSidebarAction =
    RSA<ReflectionSidebarActionType.EDIT_PAGE, ReflectionEditPageAction>
    | RSA<ReflectionSidebarActionType.EDIT_WIDGET, ReflectionEditWidgetAction>;

export interface ReflectionEditPageAction {
    page: ReflectionPage;
    onChange: (page: ReflectionPage) => void;
}

export interface ReflectionEditWidgetAction {
    widget: ReflectionWidget;
    forms: Form[];
}

export interface RSA<T extends ReflectionSidebarActionType, V> {
    type: T;
    value: V;
}
