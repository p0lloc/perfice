export enum TrackableCardType {
    CHART = "CHART",
    VALUE = "VALUE",
}

export interface Trackable {
    id: string;
    name: string;
    formId: string;
    categoryId: string | null;
    cardType: TrackableCardType;
    // Mapping of dependency to variable id
    dependencies: Record<string, string>;
}

export interface TrackableCategory {
    id: string;
    name: string;
}
