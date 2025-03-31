import {
    type ReflectionWidgetAnswerState,
    type ReflectionWidgetDefinition,
    ReflectionWidgetType
} from "@perfice/model/reflection/reflection";
import type {Variable, VariableTypeDef} from "@perfice/model/variable/variable";

export interface ReflectionTagsWidgetSettings {
    categories: string[];
}

export class ReflectionTagsWidgetDefinition implements ReflectionWidgetDefinition<ReflectionWidgetType.TAGS, ReflectionTagsWidgetSettings> {
    getType(): ReflectionWidgetType.TAGS {
        return ReflectionWidgetType.TAGS;
    }

    getDefaultSettings(): ReflectionTagsWidgetSettings {
        return {
            categories: []
        };
    }

    createDependencies(settings: ReflectionTagsWidgetSettings): Map<string, Variable> {
        return new Map();
    }

    updateDependencies(dependencies: Record<string, string>,
                       previousSettings: ReflectionTagsWidgetSettings, settings: ReflectionTagsWidgetSettings): Map<string, VariableTypeDef> {

        return new Map();
    }

    createAnswerState(): ReflectionWidgetAnswerState {
        return {
            type: ReflectionWidgetType.TAGS,
            state: {
                tags: []
            }
        };
    }

}

export interface ReflectionTagsWidgetAnswerState {
    tags: string[];
}