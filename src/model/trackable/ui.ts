import type {Form, FormQuestion} from "../form/form";
import {
    type CS,
    type Trackable,
    TrackableCardType,
    type TrackableCategory,
    type TrackableValueSettings,
    TrackableValueType,
} from "./trackable";
import {AggregateType} from "@perfice/services/variable/types/aggregate";
import type {TextOrDynamic} from "@perfice/model/variable/variable";
import {type DisplayValue, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";

export enum TrackableEditViewType {
    GENERAL = "GENERAL",
    INTEGRATION = "INTEGRATION",
}

export interface EditTrackableState {
    trackable: Trackable;
    categories: TrackableCategory[];
    form: Form;
    cardState: EditTrackableCardState;
}

export type EditTrackableCardState =
    CS<TrackableCardType.CHART, EditTrackableChartSettings>
    | CS<TrackableCardType.VALUE, EditTrackableValueSettings>
    | CS<TrackableCardType.TALLY, EditTrackableTallySettings>;

export interface EditTrackableChartSettings {
    aggregateType: AggregateType;
    field: string;
    color: string;
}

export const TRACKABLE_VALUE_TYPES = [
    {value: TrackableValueType.TABLE, name: "Table"},
    {value: TrackableValueType.LATEST, name: "Latest"},
];

export function getDefaultTrackableCardState(cardType: TrackableCardType, availableQuestions: FormQuestion[]): EditTrackableCardState {
    switch (cardType) {
        case TrackableCardType.CHART:
            return {
                cardType: TrackableCardType.CHART,
                cardSettings: {
                    aggregateType: AggregateType.SUM,
                    field: availableQuestions.length > 0 ? availableQuestions[0].id : "",
                    color: "#ff0000"
                }
            };
        case TrackableCardType.VALUE:
            return {
                cardType: TrackableCardType.VALUE,
                cardSettings: {
                    // If there are no questions, we need to create a dummy representation
                    representation: availableQuestions.length > 0 ? [
                        {dynamic: true, value: availableQuestions[0].id}
                    ] : [
                        {dynamic: false, value: ""}
                    ],
                    type: TrackableValueType.TABLE,
                    settings: {}
                }
            }
        case TrackableCardType.TALLY:
            return {
                cardType: TrackableCardType.TALLY,
                cardSettings: {
                    questionId: availableQuestions.length > 0 ? availableQuestions[0].id : ""
                }
            };
    }
}

export type EditTrackableValueSettings = TrackableValueSettings;
export type EditTrackableTallySettings = {
    questionId: string;
};

export function formatAnswersIntoRepresentation(answers: Record<string, PrimitiveValue>, representation: TextOrDynamic[]): string {
    let result: string = "";
    for (let rep of representation) {
        if (rep.dynamic) {
            let answerValue = answers[rep.value];
            if (answerValue == null) return "Missing value";

            let display;
            if(answerValue.type == PrimitiveValueType.DISPLAY) {
                let displayValue = answerValue.value;
                display = displayValue.display?.value ?? displayValue.value;
            } else {
                display = answerValue;
            }

            result += display.toString();
        } else {
            result += rep.value;
        }
    }

    return result;
}
