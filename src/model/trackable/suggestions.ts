import trackableSuggestionsAsset from '@perfice/assets/trackable_suggestions.json?raw'
import {
    type LatestTrackableValueSettings,
    type TableTrackableValueSettings,
    type Trackable,
    type TrackableCardSettings,
    TrackableCardType,
    type TrackableChartSettings,
    type TrackableTallySettings,
    TrackableValueType
} from "@perfice/model/trackable/trackable";
import type {Form} from "@perfice/model/form/form";
import {
    type FormSuggestion,
    parseFormSuggestion,
    serializeFormToSuggestion,
    updateTextOrDynamicAssigned
} from "@perfice/model/form/suggestions";
import type {TextOrDynamic} from "@perfice/model/variable/variable";

export interface TrackableSuggestionGroup {
    name: string;
    suggestions: TrackableSuggestion[];
}

export type TrackableSuggestion = {
    name: string;
    icon: string;
    default?: boolean;
    form: FormSuggestion;
} & TrackableSuggestionCardSettings;

export type TrackableSuggestionCardSettings =
    SCS<TrackableCardType.CHART, TrackableSuggestionChartSettings>
    | SCS<TrackableCardType.VALUE, TrackableSuggestionValueSettings>
    | SCS<TrackableCardType.TALLY, TrackableSuggestionTallySettings>;

export interface SCS<K extends TrackableCardType, V> {
    cardType: K;
    cardSettings: V;
}

export interface TrackableSuggestionTallySettings extends TrackableTallySettings {
}

export interface TrackableSuggestionChartSettings extends TrackableChartSettings {
}


export type TrackableSuggestionValueSettings = {
    representation: TextOrDynamic[];
} & TrackableValueSettingValues;

export type TrackableValueSettingValues = TV<TrackableValueType.LATEST, LatestTrackableValueSettings>
    | TV<TrackableValueType.TABLE, TableTrackableValueSettings>;

export interface TV<K extends TrackableValueType, V> {
    type: K;
    settings: V;
}

export const TRACKABLE_SUGGESTIONS: TrackableSuggestionGroup[] = JSON.parse(trackableSuggestionsAsset);

export function parseCardSettings(suggestion: TrackableSuggestionCardSettings, assignedQuestions: Map<string, string>): TrackableCardSettings {
    switch (suggestion.cardType) {
        case TrackableCardType.CHART: {
            let cardSettings = suggestion.cardSettings as TrackableSuggestionChartSettings;
            return {
                cardType: TrackableCardType.CHART,
                cardSettings: {
                    aggregateType: cardSettings.aggregateType,
                    field: assignedQuestions.get(cardSettings.field) ?? cardSettings.field,
                    color: cardSettings.color
                }
            }
        }
        case TrackableCardType.VALUE: {
            let cardSettings = suggestion.cardSettings as TrackableSuggestionValueSettings;
            return {
                cardType: TrackableCardType.VALUE,
                cardSettings: {
                    representation: updateTextOrDynamicAssigned(cardSettings.representation, assignedQuestions),
                    type: cardSettings.type,
                    settings: cardSettings.settings
                }
            }
        }
        case TrackableCardType.TALLY: {
            let cardSettings = suggestion.cardSettings as TrackableSuggestionTallySettings;
            return {
                cardType: TrackableCardType.TALLY,
                cardSettings: {
                    field: assignedQuestions.get(cardSettings.field) ?? cardSettings.field
                }
            }
        }
    }
}

export function parseTrackableSuggestion(suggestion: TrackableSuggestion): [Trackable, Form, Map<string, string>] {
    let [form, assignedQuestions] = parseFormSuggestion(suggestion.form, suggestion.name, suggestion.icon);

    let trackable: Trackable = {
        id: crypto.randomUUID(),
        name: suggestion.name,
        icon: suggestion.icon,
        formId: "",
        order: 0,
        categoryId: null,
        dependencies: {},
        ...parseCardSettings(suggestion, assignedQuestions)
    }

    return [trackable, form, assignedQuestions];
}

export function serializeTrackableToSuggestion(trackable: Trackable, form: Form): TrackableSuggestion {
    let serializedForm = serializeFormToSuggestion(form);
    return {
        name: trackable.name,
        icon: trackable.icon,
        form: serializedForm,
        ...serializeCardSettingsToSuggestion(trackable)
    }
}

export function serializeCardSettingsToSuggestion(trackable: Trackable): TrackableSuggestionCardSettings {
    switch (trackable.cardType) {
        case TrackableCardType.CHART: {
            let cardSettings = trackable.cardSettings;
            return {
                cardType: TrackableCardType.CHART,
                cardSettings: {
                    aggregateType: cardSettings.aggregateType,
                    field: cardSettings.field,
                    color: cardSettings.color
                }
            }
        }
        case TrackableCardType.VALUE: {
            let cardSettings = trackable.cardSettings;
            return {
                cardType: TrackableCardType.VALUE,
                cardSettings: {
                    representation: cardSettings.representation,
                    type: cardSettings.type,
                    settings: cardSettings.settings
                }
            }
        }
        case TrackableCardType.TALLY: {
            return {
                cardType: TrackableCardType.TALLY,
                cardSettings: {
                    field: trackable.cardSettings.field
                }
            }
        }
    }
}