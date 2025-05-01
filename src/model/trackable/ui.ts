import type {Form, FormQuestion} from "../form/form";
import {
    type Trackable,
    type TrackableCardSettings,
    TrackableCardType,
    type TrackableCategory,
    TrackableValueType,
} from "./trackable";
import {AggregateType} from "@perfice/services/variable/types/aggregate";
import type {TextOrDynamic} from "@perfice/model/variable/variable";
import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";

export enum TrackableEditViewType {
    GENERAL = "GENERAL",
    IMPORT_EXPORT = "IMPORT_EXPORT",
}

export interface EditTrackableState {
    trackable: Trackable;
    categories: TrackableCategory[];
    form: Form;
}

export const TRACKABLE_FORM_ENTITY_TYPE = "trackable";
export const TRACKABLE_FORM_CATEGORY_DELIM = ";";

export const TRACKABLE_VALUE_TYPES = [
    {value: TrackableValueType.TABLE, name: "Table"},
    {value: TrackableValueType.LATEST, name: "Latest"},
];

export function getDefaultTrackableCardState(cardType: TrackableCardType, availableQuestions: FormQuestion[]): TrackableCardSettings {
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
                    field: availableQuestions.length > 0 ? availableQuestions[0].id : ""
                }
            };
    }
}

export function formatAnswersIntoRepresentation(answers: Record<string, PrimitiveValue>, representation: TextOrDynamic[]): string {
    let result: string = "";
    for (let rep of representation) {
        if (rep.dynamic) {
            let display;
            let answerValue = answers[rep.value];
            if (answerValue != null) {
                if (answerValue.type == PrimitiveValueType.DISPLAY) {
                    let displayValue = answerValue.value;
                    display = displayValue.display?.value ?? displayValue.value;
                } else {
                    display = answerValue;
                }
            } else {
                display = "";
            }

            result += display.toString();
        } else {
            result += rep.value;
        }
    }

    return result;
}
