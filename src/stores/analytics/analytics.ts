import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import type {AnalyticsService, CorrelationResult, RawAnalyticsValues} from "@perfice/services/analytics/analytics";
import type {Form} from "@perfice/model/form/form";
import type { FormStore } from "../form/form";

export interface AnalyticsResult {
    correlations: Map<string, CorrelationResult>;
    forms: Form[];
    rawValues: RawAnalyticsValues;
}

export class AnalyticsStore {
    private readonly analyticsService: AnalyticsService;

    constructor(analyticsService: AnalyticsService, formStore: FormStore) {
        this.analyticsService = analyticsService;
    }

    async fetchAnalytics(date: Date, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {
        let [rawValues, forms] = await this.analyticsService.fetchRawValues(SimpleTimeScopeType.DAILY, range);
        let correlations = await this.analyticsService.runBasicCorrelations(rawValues, date, range, minimumSampleSize);

        return {
            correlations,
            forms,
            rawValues
        };
    }
}