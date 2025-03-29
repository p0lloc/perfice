import {createTypeDefForTableWidget, type TableWidgetSettings} from "@perfice/model/table/table";
import {ReflectionWidgetType, type ReflectionWidgetDefinition} from "../reflection";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";

export interface ReflectionTableWidgetSettings extends TableWidgetSettings {
}

export class ReflectionTableWidgetDefinition implements ReflectionWidgetDefinition<ReflectionWidgetType.TABLE, ReflectionTableWidgetSettings> {
    getType(): ReflectionWidgetType.TABLE {
        return ReflectionWidgetType.TABLE;
    }

    getDefaultSettings(): ReflectionTableWidgetSettings {
        return {
            formId: "",
            prefix: [],
            suffix: [],
            groupBy: null
        };
    }

    createDependencies(settings: ReflectionTableWidgetSettings): Map<string, Variable> {
        return new Map([["list", {
            id: crypto.randomUUID(),
            name: "List",
            type: createTypeDefForTableWidget(settings)
        }]]);
    }

    updateDependencies(dependencies: Record<string, string>,
                       previousSettings: ReflectionTableWidgetSettings, settings: ReflectionTableWidgetSettings): Map<string, VariableTypeDef> {

        return new Map([["list", createTypeDefForTableWidget(settings)]]);
    }
}