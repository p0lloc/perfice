import type {TextOrDynamic} from "@perfice/model/variable/variable";
import type {ChecklistCondition} from "@perfice/model/dashboard/widgets/checklist";

export interface Reflection {
    id: string;
    name: string;
    pages: ReflectionPage[];
}

export interface ReflectionPage {
    id: string;
    name: string;
    icon: string | null;
    description: string;
    widgets: ReflectionWidget[];
}

export type ReflectionWidget = {
    id: string;
} & ReflectionWidgetTypes;

export enum ReflectionWidgetType {
    FORM = "FORM",
    TABLE = "TABLE",
    TAGS = "TAGS",
    CHECKLIST = "CHECKLIST",
}

export type ReflectionWidgetTypes = RW<ReflectionWidgetType.FORM, ReflectionFormWidgetSettings>
    | RW<ReflectionWidgetType.TABLE, ReflectionTableWidgetSettings>
    | RW<ReflectionWidgetType.TAGS, ReflectionTagsWidgetSettings>
    | RW<ReflectionWidgetType.CHECKLIST, ReflectionChecklistWidgetSettings>;

export interface ReflectionFormWidgetSettings {
    formId: string;
}

export interface ReflectionTagsWidgetSettings {
    categories: string[];
}

export interface ReflectionTableWidgetSettings {
    formId: string;
    prefix: TextOrDynamic[];
    suffix: TextOrDynamic[];
    // Question id to optionally group by
    groupBy: string | null;
}

export interface ReflectionChecklistWidgetSettings {
    conditions: ChecklistCondition[];
}

export interface RW<T extends ReflectionWidgetType, V> {
    type: T;
    settings: V;
}