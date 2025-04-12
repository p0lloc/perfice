import {createTypeDefForTableWidget, type TableWidgetSettings} from "@perfice/model/sharedWidgets/table/table";
import {type ReflectionWidgetAnswerState, type ReflectionWidgetDefinition, ReflectionWidgetType} from "../reflection";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";

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
            timeScope: SimpleTimeScopeType.DAILY,
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

    createAnswerState(): ReflectionWidgetAnswerState {
        return {
            type: ReflectionWidgetType.TABLE,
            state: {
                answers: []
            }
        };
    }

}

export interface ReflectionTableWidgetAnswerState {
    answers: Record<string, PrimitiveValue>[];
}