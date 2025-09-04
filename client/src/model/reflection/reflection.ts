import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import {
    type ReflectionFormWidgetAnswerState,
    ReflectionFormWidgetDefinition,
    type ReflectionFormWidgetSettings
} from "@perfice/model/reflection/widgets/form";
import {
    type ReflectionTagsWidgetAnswerState,
    ReflectionTagsWidgetDefinition,
    type ReflectionTagsWidgetSettings
} from "@perfice/model/reflection/widgets/tags";
import {
    type ReflectionTableWidgetAnswerState,
    ReflectionTableWidgetDefinition,
    type ReflectionTableWidgetSettings
} from "@perfice/model/reflection/widgets/table";
import {
    type ReflectionChecklistWidgetAnswerState,
    ReflectionChecklistWidgetDefinition,
    type ReflectionChecklistWidgetSettings
} from "@perfice/model/reflection/widgets/checklist";

export interface Reflection {
    id: string;
    name: string;
    openType: ReflectionAutoOpenType;
    pages: ReflectionPage[];
}

export enum ReflectionAutoOpenType {
    DISABLE = "DISABLE",
    DAILY = "DAILY",
}

export const REFLECTION_AUTO_OPEN_TYPES = [
    {name: "Disabled", value: ReflectionAutoOpenType.DISABLE},
    {name: "Daily", value: ReflectionAutoOpenType.DAILY},
];

export interface ReflectionPage {
    id: string;
    name: string;
    icon: string | null;
    description: string;
    widgets: ReflectionWidget[];
}

export type ReflectionWidgetAnswerState = RWA<ReflectionWidgetType.FORM, ReflectionFormWidgetAnswerState>
    | RWA<ReflectionWidgetType.TAGS, ReflectionTagsWidgetAnswerState>
    | RWA<ReflectionWidgetType.TABLE, ReflectionTableWidgetAnswerState>
    | RWA<ReflectionWidgetType.CHECKLIST, ReflectionChecklistWidgetAnswerState>
    ;

export interface RWA<T extends ReflectionWidgetType, V> {
    type: T;
    state: V;
}

export function generateAnswerStates(widgets: ReflectionWidget[]): Record<string, ReflectionWidgetAnswerState> {
    let res: Record<string, ReflectionWidgetAnswerState> = {};
    for (let widget of widgets) {

        let definition = getReflectionWidgetDefinition(widget.type);
        if (definition == null) continue;

        res[widget.id] = definition.createAnswerState();
    }

    return res;
}

export type ReflectionWidget = {
    id: string;
    dependencies: Record<string, string>;
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

export interface RW<T extends ReflectionWidgetType, V> {
    type: T;
    settings: V;
}

export interface ReflectionWidgetDefinition<T extends ReflectionWidgetType, S> {
    getType(): T;

    getDefaultSettings(): S;

    // Creates the variables that this widget depends on
    createDependencies(settings: S): Map<string, Variable>;

    // Returns the variable updates should occur when the settings change
    updateDependencies(dependencies: Record<string, string>, previousSettings: S, updatedSettings: S): Map<string, VariableTypeDef>;

    createAnswerState(): ReflectionWidgetAnswerState;
}

const definitions: Map<ReflectionWidgetType, ReflectionWidgetDefinition<ReflectionWidgetType, any>> = new Map();
definitions.set(ReflectionWidgetType.FORM, new ReflectionFormWidgetDefinition());
definitions.set(ReflectionWidgetType.TAGS, new ReflectionTagsWidgetDefinition());
definitions.set(ReflectionWidgetType.TABLE, new ReflectionTableWidgetDefinition());
definitions.set(ReflectionWidgetType.CHECKLIST, new ReflectionChecklistWidgetDefinition());

export function getReflectionWidgetDefinitions(): ReflectionWidgetDefinition<ReflectionWidgetType, any>[] {
    return Array.from(definitions.values());
}

export function getReflectionWidgetDefinition(type: ReflectionWidgetType): ReflectionWidgetDefinition<ReflectionWidgetType, any> | undefined {
    return definitions.get(type);
}
