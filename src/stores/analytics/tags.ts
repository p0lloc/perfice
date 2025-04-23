import {derived, readable, type Readable} from "svelte/store";
import type {Tag} from "@perfice/model/tag/tag";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {
    AnalyticsService,
    type CorrelationResult,
    TAG_KEY_PREFIX,
    type TagWeekDayAnalytics
} from "@perfice/services/analytics/analytics";
import {
    type AnalyticsResult,
    createDetailedCorrelations,
    type DetailCorrelation
} from "@perfice/stores/analytics/analytics";
import {WEEK_DAYS_SHORT} from "@perfice/util/time/format";
import {analytics} from "@perfice/stores";

export interface TagAnalyticsResult {
    results: SingleTagAnalyticsResult[];
    date: Date;
}

export interface SingleTagAnalyticsResult {
    tag: Tag;
    values: Map<number, number>;
}

export type TagWeekDayAnalyticsTransformed = Omit<TagWeekDayAnalytics, 'values'> & {
    labels: string[];
    dataPoints: number[];
}

export interface TagDetailedAnalyticsResult {
    tag: Tag;
    weekDayAnalytics: TagWeekDayAnalyticsTransformed;
    correlations: DetailCorrelation[];
    values: Map<number, number>;
    date: Date;
}

export function TagAnalytics(): Readable<Promise<TagAnalyticsResult>> {
    return derived([analytics], ([$res], set) => {
        let promise = new Promise<TagAnalyticsResult>(
            async (resolve) => {
                let result = await $res;

                let results: SingleTagAnalyticsResult[] = [];
                for (let tag of result.tags) {
                    let values = result.tagValues.get(`${TAG_KEY_PREFIX}${tag.id}`);
                    if (values == null) continue;

                    results.push({tag, values})
                }

                resolve({results, date: result.date});
            }
        );

        set(promise);
    });
}


function createPromise(id: string,
                       res: Promise<AnalyticsResult>,
                       analyticsService: AnalyticsService,
                       timeScope: SimpleTimeScopeType) {
    return new Promise<TagDetailedAnalyticsResult>(
        async (resolve) => {
            let result = await res;

            let tag = result.tags.find(t => t.id == id);
            if (tag == null) return;

            let values = result.tagValues.get(`${TAG_KEY_PREFIX}${tag.id}`);
            if (values == null) return;

            let weekDayAnalytics = await analyticsService.calculateTagWeekDayAnalytics(values);

            let correlations = result.correlations.get(timeScope) ?? new Map<string, CorrelationResult>();

            resolve({
                tag,
                weekDayAnalytics: {
                    ...weekDayAnalytics,
                    labels: weekDayAnalytics.values.keys().map(v => WEEK_DAYS_SHORT[v]).toArray(),
                    dataPoints: weekDayAnalytics.values.values().toArray(),
                },
                correlations: createDetailedCorrelations(correlations, result, tag.id, timeScope),
                values,
                date: result.date,
            });
        });
}

export function TagDetailedAnalytics(id: string,
                                     timeScope: SimpleTimeScopeType,
                                     analyticsService: AnalyticsService): Readable<Promise<TagDetailedAnalyticsResult>> {

    if (timeScope != SimpleTimeScopeType.DAILY) {
        // Differing time scope requires a new analytics result
        return readable(createPromise(id, analytics.getSpecificAnalytics(new Date(), 30, 5), analyticsService, timeScope));
    } else {
        // Use cached value from analytics store
        return derived([analytics], ([$res], set) => {
            set(createPromise(id, $res, analyticsService, timeScope));
        });
    }
}
