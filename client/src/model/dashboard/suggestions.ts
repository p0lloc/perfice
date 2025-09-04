import dashboardSuggestionsAsset from '@perfice/assets/dashboard_suggestions.json?raw'
import {type DashboardWidgetDisplaySettings, type DashboardWidgetSettings, DashboardWidgetType} from "./dashboard";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {Form} from "@perfice/model/form/form";
import {manipulateTextOrDynamic} from "@perfice/model/form/suggestions";

export const DASHBOARD_SUGGESTIONS: Record<string, DashboardSuggestion> = JSON.parse(dashboardSuggestionsAsset);

export function manipulateSuggestionWidgetSettings(suggestion: DashboardWidgetSettings, createdTrackables: Map<string, {
                                                       trackable: Trackable,
                                                       form: Form,
                                                       assignedQuestions: Map<string, string>
                                                   }>,
                                                   assignedGoals: Map<string, string>
): any {

    switch (suggestion.type) {
        case DashboardWidgetType.ENTRY_ROW: {
            let data = createdTrackables.get(suggestion.settings.formId);
            if (data == null) break;

            return {
                ...suggestion.settings,
                formId: data.form.id,
                questionId: data.assignedQuestions.get(suggestion.settings.questionId) ?? suggestion.settings.questionId
            }
        }
        case DashboardWidgetType.METRIC: {
            let data = createdTrackables.get(suggestion.settings.formId);
            if (data == null) break;

            return {
                ...suggestion.settings,
                formId: data.form.id,
                field: data.assignedQuestions.get(suggestion.settings.field) ?? suggestion.settings.field
            };
        }
        case DashboardWidgetType.CHART: {
            let data = createdTrackables.get(suggestion.settings.formId);
            if (data == null) break;

            return {
                ...suggestion.settings,
                formId: data.form.id,
                questionId: data.assignedQuestions.get(suggestion.settings.questionId) ?? suggestion.settings.questionId,
                groupBy: suggestion.settings.groupBy != null ?
                    (data.assignedQuestions.get(suggestion.settings.groupBy) ?? suggestion.settings.groupBy) : null
            };
        }
        case DashboardWidgetType.TRACKABLE: {
            let data = createdTrackables.get(suggestion.settings.trackableId);
            if (data == null) break;

            return {
                ...suggestion.settings,
                trackableId: data.trackable.id
            };
        }
        case DashboardWidgetType.TABLE: {
            let data = createdTrackables.get(suggestion.settings.formId);
            if (data == null) break;

            return {
                ...suggestion.settings,
                formId: data.form.id,
                prefix: suggestion.settings.prefix.map(v => manipulateTextOrDynamic(v, data.assignedQuestions)),
                suffix: suggestion.settings.suffix.map(v => manipulateTextOrDynamic(v, data.assignedQuestions)),
                groupBy: suggestion.settings.groupBy != null
                    ? (data.assignedQuestions.get(suggestion.settings.groupBy) ?? suggestion.settings.groupBy) : null
            };
        }
        case DashboardWidgetType.GOAL: {
            return {
                ...suggestion.settings,
                goalVariableId: assignedGoals.get(suggestion.settings.goalVariableId) ?? suggestion.settings.goalVariableId
            };
        }
    }

    return suggestion.settings;
}


export interface DashboardSuggestion {
    name: string;
    widgets: DashboardWidgetSuggestion[];
}

export type DashboardWidgetSuggestion = {
    display: DashboardWidgetDisplaySettings;
} & DashboardWidgetSettings;

