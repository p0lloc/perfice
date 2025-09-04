import reflectionSuggestionsAsset from '@perfice/assets/reflection_suggestions.json?raw'
import {ReflectionWidgetType, type ReflectionWidgetTypes, type RW} from "@perfice/model/reflection/reflection";
import type {ReflectionFormWidgetSettings} from "@perfice/model/reflection/widgets/form";
import type {ReflectionTableWidgetSettings} from "@perfice/model/reflection/widgets/table";
import type {ReflectionTagsWidgetSettings} from "@perfice/model/reflection/widgets/tags";
import type {ReflectionChecklistWidgetSettings} from "@perfice/model/reflection/widgets/checklist";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {Form} from "@perfice/model/form/form";
import {manipulateTextOrDynamic} from "@perfice/model/form/suggestions";

export const REFLECTION_SUGGESTIONS: ReflectionSuggestion[] = JSON.parse(reflectionSuggestionsAsset);

export interface ReflectionSuggestion {
    name: string;
    pages: ReflectionSuggestionPage[];
}

export interface ReflectionSuggestionPage {
    name: string;
    icon: string | null;
    description: string;
    widgets: ReflectionSuggestionWidget[];
}

export type ReflectionSuggestionWidget = ReflectionSuggestionWidgetTypes;

export type ReflectionSuggestionWidgetTypes = RW<ReflectionWidgetType.FORM, ReflectionFormWidgetSettings>
    | RW<ReflectionWidgetType.TABLE, ReflectionTableWidgetSettings>
    | RW<ReflectionWidgetType.TAGS, ReflectionTagsWidgetSettings>
    | RW<ReflectionWidgetType.CHECKLIST, ReflectionChecklistWidgetSettings>;


export function manipulateReflectionSuggestionWidgetSettings(suggestion: ReflectionSuggestionWidget, createdTrackables: Map<string, {
                                                                 trackable: Trackable,
                                                                 form: Form,
                                                                 assignedQuestions: Map<string, string>
                                                             }>,
): ReflectionWidgetTypes {
    switch (suggestion.type) {
        case ReflectionWidgetType.FORM: {
            let data = createdTrackables.get(suggestion.settings.formId);
            if (data == null) break;

            return {
                type: suggestion.type,
                settings: {
                    ...suggestion.settings,
                    formId: data.form.id,
                }
            }
        }
        case ReflectionWidgetType.TABLE: {
            let data = createdTrackables.get(suggestion.settings.formId);
            if (data == null) break;

            return {
                type: suggestion.type,
                settings: {
                    ...suggestion.settings,
                    formId: data.form.id,
                    prefix: suggestion.settings.prefix.map(v => manipulateTextOrDynamic(v, data.assignedQuestions)),
                    suffix: suggestion.settings.suffix.map(v => manipulateTextOrDynamic(v, data.assignedQuestions)),
                    groupBy: suggestion.settings.groupBy != null
                        ? (data.assignedQuestions.get(suggestion.settings.groupBy) ?? suggestion.settings.groupBy) : null
                }
            }
        }
        case ReflectionWidgetType.TAGS: {
            return {
                type: suggestion.type,
                settings: {
                    categories: []
                }
            }
        }
    }

    return {
        type: suggestion.type,
        settings: suggestion.settings
    } as ReflectionWidgetTypes;
}