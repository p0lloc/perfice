import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import type {
    AnalyticsService,
    CorrelationResult,
    RawAnalyticsValues,
    TagAnalyticsValues
} from "@perfice/services/analytics/analytics";
import type {Form} from "@perfice/model/form/form";
import {AsyncStore} from "@perfice/stores/store";
import type {Tag} from "@perfice/model/tag/tag";
import {convertResultKey} from "@perfice/services/analytics/display";

export interface AnalyticsResult {
    correlations: Map<string, CorrelationResult>;
    forms: Form[];
    tags: Tag[];
    rawValues: RawAnalyticsValues;
    tagValues: TagAnalyticsValues;

    timeScope: SimpleTimeScopeType;
    range: number;
}

async function fetchAnalytics(analyticsService: AnalyticsService, date: Date, timeScope: SimpleTimeScopeType, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {
    let [rawValues, forms] = await analyticsService.fetchRawValues(timeScope, date, range);
    let [tagValues, tags] = await analyticsService.fetchTagValues(timeScope, date, range);
    let correlations = await analyticsService.runBasicCorrelations(rawValues, tagValues, date, range, minimumSampleSize);

    return {
        correlations,
        forms,
        rawValues,
        tagValues,
        timeScope,
        tags,
        range
    };
}

export interface DetailCorrelation {
    key: string;
    name: string;
    value: CorrelationResult;
}

export function createDetailedCorrelations(result: AnalyticsResult, search: string): DetailCorrelation[] {
    return result.correlations.entries()
        .filter(([k, v]) => k.includes(search) && Math.abs(v.coefficient) > 0.2)
        .map(([key, value]) => {
            return {key, name: convertResultKey(key, result.forms, result.tags), value};
        })
        .toArray().sort((a, b) => {
            if (b.value.coefficient > 0 && a.value.coefficient < 0) {
                return 1;
            } else if (b.value.coefficient < 0 && a.value.coefficient > 0) {
                return -1;
            } else {
                return Math.abs(b.value.coefficient) - Math.abs(a.value.coefficient);
            }
        });
}

export class AnalyticsStore extends AsyncStore<AnalyticsResult> {

    private readonly analyticsService: AnalyticsService;

    constructor(analyticsService: AnalyticsService, date: Date, range: number, minimumSampleSize: number) {
        super(fetchAnalytics(analyticsService, date, SimpleTimeScopeType.DAILY, range, minimumSampleSize));
        this.analyticsService = analyticsService;
    }

    async getSpecificAnalytics(date: Date, timeScope: SimpleTimeScopeType, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {
        let analytics = await this.get();
        if (analytics.timeScope == timeScope && analytics.range == range) {
            return analytics;
        }

        return fetchAnalytics(this.analyticsService, date, timeScope, range, minimumSampleSize);
    }

}