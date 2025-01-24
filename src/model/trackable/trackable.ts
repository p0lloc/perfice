import type {TextOrDynamic} from "@perfice/model/variable/variable";

export enum TrackableCardType {
    CHART = "CHART",
    VALUE = "VALUE",
}

export type Trackable = {
    id: string;
    name: string;
    formId: string;
    categoryId: string | null;
    // Mapping of dependency to variable id
    dependencies: Record<string, string>;
} & TrackableCardSettings;

export type TrackableCardSettings =
    CS<TrackableCardType.CHART, TrackableChartSettings>
    | CS<TrackableCardType.VALUE, TrackableValueSettings>;

export interface TrackableChartSettings {

}

export interface TrackableValueSettings {
    representation: TextOrDynamic[];
}

export interface CS<K extends TrackableCardType, V> {
    cardType: K;
    cardSettings: V;
}

export interface TrackableCategory {
    id: string;
    name: string;
}
