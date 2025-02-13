import type {Form} from "../form/form";
import {
    type CS,
    type Trackable,
    TrackableCardType,
} from "./trackable";
import type {AggregateType} from "@perfice/services/variable/types/aggregate";
import type {TextOrDynamic} from "@perfice/model/variable/variable";

export enum TrackableEditViewType {
    GENERAL = "GENERAL",
    INTEGRATION = "INTEGRATION",
}

export interface EditTrackableState {
    trackable: Trackable;
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

export interface EditTrackableValueSettings {
    representation: TextOrDynamic[];
}
