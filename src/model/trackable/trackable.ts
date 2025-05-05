import type {TextOrDynamic} from "@perfice/model/variable/variable";
import type {AggregateType} from "@perfice/services/variable/types/aggregate";

export enum TrackableCardType {
    CHART = "CHART",
    VALUE = "VALUE",
    TALLY = "TALLY",
}

export type Trackable = {
    id: string;
    name: string;
    icon: string;
    formId: string;
    order: number;
    categoryId: string | null;
    // Mapping of dependency to variable id
    dependencies: Record<string, string>;
} & TrackableCardSettings;

export type TrackableCardSettings =
    CS<TrackableCardType.CHART, TrackableChartSettings>
    | CS<TrackableCardType.VALUE, TrackableValueSettings>
    | CS<TrackableCardType.TALLY, TrackableTallySettings>;

export interface CS<K extends TrackableCardType, V> {
    cardType: K;
    cardSettings: V;
}

export interface TrackableTallySettings {
    field: string;
}

export interface TrackableChartSettings {
    aggregateType: AggregateType;
    field: string;
    color: string;
}

export enum TrackableValueType {
    TABLE = "TABLE",
    LATEST = "LATEST"
}

export type TrackableValueSettings = {
    representation: TextOrDynamic[];
} & TrackableValueSettingValues;

export type TrackableValueSettingValues = TV<TrackableValueType.LATEST, LatestTrackableValueSettings>
    | TV<TrackableValueType.TABLE, TableTrackableValueSettings>;

export interface LatestTrackableValueSettings {
}

export interface TableTrackableValueSettings {
}

export interface TV<K extends TrackableValueType, V> {
    type: K;
    settings: V;
}


export interface TrackableCategory {
    id: string;
    name: string;
    order: number;
}
