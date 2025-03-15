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
import {convertResultKey, type CorrelationDisplay} from "@perfice/services/analytics/display";
import type {AnalyticsSettingsService} from "@perfice/services/analytics/settings";
import type {AnalyticsHistoryService} from "@perfice/services/analytics/history";

export interface AnalyticsResult {
    correlations: Map<string, CorrelationResult>;
    forms: Form[];
    tags: Tag[];
    rawValues: RawAnalyticsValues;
    tagValues: TagAnalyticsValues;

    timeScope: SimpleTimeScopeType;
    range: number;
    date: Date;
}

async function fetchAnalytics(analyticsService: AnalyticsService, settingsService: AnalyticsSettingsService,
                              historyService: AnalyticsHistoryService | null,
                              date: Date, timeScope: SimpleTimeScopeType, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {

    let allSettings = await settingsService.getAllSettings();
    let [rawValues, forms] = await analyticsService.fetchRawValues(timeScope, date, range);
    let [tagValues, tags] = await analyticsService.fetchTagValues(timeScope, date, 7 * 14);
    // TODO: limit tag values to same range for correlations
    let correlations = await analyticsService.runBasicCorrelations(rawValues, tagValues, allSettings, date, range, minimumSampleSize);

    if (historyService != null) {
        historyService.processResult(correlations, date);
    }

    return {
        correlations,
        forms,
        rawValues,
        tagValues,
        timeScope,
        tags,
        range,
        date
    };
}

export interface DetailCorrelation {
    key: string;
    display: CorrelationDisplay;
    value: CorrelationResult;
}

export function createDetailedCorrelations(result: AnalyticsResult, search: string): DetailCorrelation[] {
    return result.correlations.entries()
        .filter(([k, v]) => k.includes(search) && Math.abs(v.coefficient) > 0.2)
        .map(([key, value]) => {
            return {
                key,
                display: convertResultKey(key, value, result.forms, result.tags),
                value
            };
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
    private readonly settingsService: AnalyticsSettingsService;

    constructor(analyticsService: AnalyticsService, settingsService: AnalyticsSettingsService,
                historyService: AnalyticsHistoryService,
                date: Date, range: number, minimumSampleSize: number) {
        super(fetchAnalytics(analyticsService, settingsService, historyService, date, SimpleTimeScopeType.DAILY, range, minimumSampleSize));
        this.settingsService = settingsService;
        this.analyticsService = analyticsService;
    }

    async getSpecificAnalytics(date: Date, timeScope: SimpleTimeScopeType, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {
        let analytics = await this.get();
        if (analytics.timeScope == timeScope && analytics.range == range) {
            return analytics;
        }

        return fetchAnalytics(this.analyticsService, this.settingsService, null, date, timeScope, range, minimumSampleSize);
    }

}