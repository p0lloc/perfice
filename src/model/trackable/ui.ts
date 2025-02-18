import type {Form} from "../form/form";
import {
    type CS,
    type Trackable,
    TrackableCardType, type TrackableCategory, type TrackableValueSettings, TrackableValueType,
} from "./trackable";
import type {AggregateType} from "@perfice/services/variable/types/aggregate";
import type {TextOrDynamic} from "@perfice/model/variable/variable";
import type {DisplayValue, JournalEntryValue, PrimitiveValue} from "@perfice/model/primitive/primitive";

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
    | CS<TrackableCardType.VALUE, EditTrackableValueSettings>;

export interface EditTrackableChartSettings {
    aggregateType: AggregateType;
    field: string;
    color: string;
}

export const TRACKABLE_VALUE_TYPES = [
    {value: TrackableValueType.TABLE, name: "Table"},
    {value: TrackableValueType.LATEST, name: "Latest"},
    {value: TrackableValueType.TALLY, name: "Tally"},
];

export type EditTrackableValueSettings = TrackableValueSettings;

export function formatEntryIntoRepresentation(entry: JournalEntryValue, representation: TextOrDynamic[]): string {
    let answerMap: Record<string, PrimitiveValue> = entry.value;

    let result: string = "";
    for (let rep of representation) {
        if (rep.dynamic) {
            let answerValue = answerMap[rep.value];
            if (answerValue == null) return "Missing value";

            let displayValue = (answerValue.value as DisplayValue);
            let display = displayValue.display?.value ?? displayValue.value;
            result += display.toString();
        } else {
            result += rep.value;
        }
    }

    return result;
}
