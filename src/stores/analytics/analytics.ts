import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import type {
    AnalyticsService,
    BasicAnalytics,
    CorrelationResult,
    RawAnalyticsValues,
    TagAnalyticsValues
} from "@perfice/services/analytics/analytics";
import type {Form} from "@perfice/model/form/form";
import {AsyncStore} from "@perfice/stores/store";
import type {Tag} from "@perfice/model/tag/tag";
import {convertResultKey, type CorrelationDisplay} from "@perfice/services/analytics/display";
import type {AnalyticsSettingsService} from "@perfice/services/analytics/settings";
import type {AnalyticsHistoryEntry, AnalyticsHistoryService} from "@perfice/services/analytics/history";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";

export interface AnalyticsResult {
    correlations: Map<SimpleTimeScopeType, Map<string, CorrelationResult>>;
    forms: Form[];
    tags: Tag[];
    rawValues: Map<SimpleTimeScopeType, RawAnalyticsValues>;
    basicAnalytics: Map<SimpleTimeScopeType, Map<string, Map<string, BasicAnalytics>>>;
    tagValues: TagAnalyticsValues;
    allSettings: AnalyticsSettings[];

    range: number;
    date: Date;
}

async function fetchAnalytics(analyticsService: AnalyticsService, settingsService: AnalyticsSettingsService,
                              historyService: AnalyticsHistoryService | null,
                              date: Date, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {

    let allSettings = await settingsService.getAllSettings();
    let [forms, entries] = await analyticsService.fetchFormsAndEntries(date, range);

    let [dailyValues] = await analyticsService.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let [tagValues, tags] = await analyticsService.fetchTagValues(SimpleTimeScopeType.DAILY, date, 7 * 14);
    // TODO: limit tag values to same range for correlations
    let dailyBasicAnalytics = await analyticsService.calculateAllBasicAnalytics(dailyValues, allSettings);
    let dailyCorrelations = await analyticsService.runBasicCorrelations(dailyValues, tagValues, allSettings, date, range, minimumSampleSize, true);

    if (historyService != null) {
        historyService.processResult(dailyCorrelations, date);
    }

    let [weeklyValues] = await analyticsService.constructRawValues(forms, entries, SimpleTimeScopeType.WEEKLY);
    let weeklyBasicAnalytics = await analyticsService.calculateAllBasicAnalytics(weeklyValues, allSettings);
    // We don't use week days or tag values for weekly correlations, only numerical/categorical
    let weeklyCorrelations = await analyticsService.runBasicCorrelations(weeklyValues, new Map(), allSettings, date, range, minimumSampleSize, false);

    let [monthlyValues] = await analyticsService.constructRawValues(forms, entries, SimpleTimeScopeType.MONTHLY);
    let monthlyBasicAnalytics = await analyticsService.calculateAllBasicAnalytics(monthlyValues, allSettings);

    return {
        correlations: new Map([
            [SimpleTimeScopeType.DAILY, dailyCorrelations],
            [SimpleTimeScopeType.WEEKLY, weeklyCorrelations],
        ]),
        forms,
        basicAnalytics: new Map([
            [SimpleTimeScopeType.DAILY, dailyBasicAnalytics],
            [SimpleTimeScopeType.WEEKLY, weeklyBasicAnalytics],
            [SimpleTimeScopeType.MONTHLY, monthlyBasicAnalytics],
        ]),
        rawValues: new Map([
            [SimpleTimeScopeType.DAILY, dailyValues],
            [SimpleTimeScopeType.WEEKLY, weeklyValues],
            [SimpleTimeScopeType.MONTHLY, monthlyValues],
        ]),
        tagValues,
        tags,
        allSettings,
        range,
        date
    };
}

export interface DetailCorrelation {
    key: string;
    display: CorrelationDisplay;
    value: CorrelationResult;
    timeScope: SimpleTimeScopeType;
}

export function createDetailedCorrelations(correlations: Map<string, CorrelationResult>, result: AnalyticsResult, search: string, timeScope: SimpleTimeScopeType): DetailCorrelation[] {
    return correlations.entries()
        .filter(([k, v]) => k.includes(search) && Math.abs(v.coefficient) > 0.2)
        .map(([key, value]) => {
            return {
                key,
                display: convertResultKey(key, value, timeScope, result.forms, result.tags),
                value,
                timeScope
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

    private readonly historyService: AnalyticsHistoryService;

    constructor(analyticsService: AnalyticsService, settingsService: AnalyticsSettingsService,
                historyService: AnalyticsHistoryService,
                date: Date, range: number, minimumSampleSize: number) {
        super(fetchAnalytics(analyticsService, settingsService, historyService, date, range, minimumSampleSize));
        this.settingsService = settingsService;
        this.analyticsService = analyticsService;
        this.historyService = historyService;
    }

    async getSpecificAnalytics(date: Date, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {
        let analytics = await this.get();
        if (analytics.range == range) {
            return analytics;
        }

        return fetchAnalytics(this.analyticsService, this.settingsService, null, date, range, minimumSampleSize);
    }

    async findHistoricalQuantitativeInsights(result: AnalyticsResult, timeScope: SimpleTimeScopeType, date: Date) {
        let basicAnalytics = result.basicAnalytics.get(timeScope);
        if (basicAnalytics == null) return [];

        let rawValues = result.rawValues.get(timeScope);
        if (rawValues == null) return [];

        return this.analyticsService.findHistoricalQuantitativeInsights(rawValues, basicAnalytics,
            date, timeScope, result.allSettings);
    }

    getNewestCorrelations(limit: number, until: number): AnalyticsHistoryEntry[] {
        return this.historyService.getNewestCorrelations(limit, until);
    }

}