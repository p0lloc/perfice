import type { SegmentedItem } from "@perfice/model/ui/segmented";

export enum AnalyticsViewType {
    TRACKABLES,
    TAGS,
    CORRELATIONS
}

export const ANALYTICS_SEGMENTED_ITEMS: SegmentedItem<AnalyticsViewType>[] = [
    { name: "Trackables", value: AnalyticsViewType.TRACKABLES },
    { name: "Tags", value: AnalyticsViewType.TAGS },
    { name: "Correlations", value: AnalyticsViewType.CORRELATIONS },
];

export function getAnalyticsDetailsLink(type: string, id: string): string {
    return `/analytics/${type}:${id}`;
}
