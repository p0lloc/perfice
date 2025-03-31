import {type ReflectionWidgetAnswerState, type ReflectionWidgetDefinition, ReflectionWidgetType} from "../reflection";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export interface ReflectionFormWidgetSettings {
    formId: string;
}

export class ReflectionFormWidgetDefinition implements ReflectionWidgetDefinition<ReflectionWidgetType.FORM, ReflectionFormWidgetSettings> {
    getType(): ReflectionWidgetType.FORM {
        return ReflectionWidgetType.FORM;
    }

    getDefaultSettings(): ReflectionFormWidgetSettings {
        return {
            formId: ""
        };
    }

    createDependencies(settings: ReflectionFormWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>,
                       previousSettings: ReflectionFormWidgetSettings, settings: ReflectionFormWidgetSettings): Map<string, VariableTypeDef> {

        return new Map();
    }

    createAnswerState(): ReflectionWidgetAnswerState {
        return {
            type: ReflectionWidgetType.FORM,
            state: {
                answers: {}
            }
        };
    }

}

export interface ReflectionFormWidgetAnswerState {
    answers: Record<string, PrimitiveValue>;
}