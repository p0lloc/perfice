import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import type {
    AnalyticsService,
    CorrelationResult,
    RawAnalyticsValues,
    TagAnalyticsValues
} from "@perfice/services/analytics/analytics";
import type {Form} from "@perfice/model/form/form";
import {AsyncStore} from "@perfice/stores/store";

export interface AnalyticsResult {
    correlations: Map<string, CorrelationResult>;
    forms: Form[];
    rawValues: RawAnalyticsValues;
    tagValues: TagAnalyticsValues;

    timeScope: SimpleTimeScopeType;
    range: number;
}

async function fetchAnalytics(analyticsService: AnalyticsService, date: Date, timeScope: SimpleTimeScopeType, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {
    let [rawValues, forms] = await analyticsService.fetchRawValues(timeScope, date, range);
    let tagValues = await analyticsService.fetchTagValues(timeScope, date, range);
    let correlations = await analyticsService.runBasicCorrelations(rawValues, tagValues, date, range, minimumSampleSize);

    return {
        correlations,
        forms,
        rawValues,
        tagValues,
        timeScope,
        range
    };
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