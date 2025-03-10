import { derived, type Readable } from "svelte/store";
import type { Trackable } from "@perfice/model/trackable/trackable";
import type { AnalyticsResult } from "@perfice/stores/analytics/analytics";
import { AnalyticsService, convertValue, type BasicAnalytics, type CategoricalWeekDayAnalytics, type CorrelationResult, type QuantitativeWeekDayAnalytics, type ValueBag } from "@perfice/services/analytics/analytics";
import { analytics, analyticsSettings, trackables } from "@perfice/main";
import type { AnalyticsSettings } from "@perfice/model/analytics/analytics";
import { formatDateYYYYMMDD, WEEK_DAYS_SHORT } from "@perfice/util/time/format";
import type { TrackableService } from "@perfice/services/trackable/trackable";
import type { AnalyticsSettingsService } from "@perfice/services/analytics/settings";
import type { FormService } from "@perfice/services/form/form";
import type { FormQuestion } from "@perfice/model/form/form";
import { convertResultKey } from "@perfice/services/analytics/display";

export enum AnalyticsChartType {
    LINE,
    PIE
}

export type AnalyticsChartData = {
    type: AnalyticsChartType.LINE,
    values: number[],
    labels: string[]
} | {
    type: AnalyticsChartType.PIE,
    values: Record<string, number>
}

export interface TrackableAnalyticsResult {
    trackable: Trackable;
    chart: AnalyticsChartData;
    settings: AnalyticsSettings;
}


export type WeekDayAnalyticsTransformed = {
    quantitative: true,
    value: Omit<QuantitativeWeekDayAnalytics, 'values'> & {
        values: Record<string, number>;
    }
} | {
    quantitative: false,
    value: CategoricalWeekDayAnalytics
}

export interface TrackableDetailCorrelation {
    key: string;
    name: string;
    value: CorrelationResult;
}

export interface TrackableDetailedAnalyticsResult {
    trackable: Trackable;
    basicAnalytics: BasicAnalytics;
    weekDayAnalytics: WeekDayAnalyticsTransformed;
    chart: AnalyticsChartData;
    correlations: TrackableDetailCorrelation[];
    questions: FormQuestion[];
    questionId: string;
}

function constructChartFromValues(bag: ValueBag, useMeanValue: boolean): AnalyticsChartData {
    if (bag.quantitative) {
        let values = [];
        let labels = [];

        for (let [timestamp, value] of bag.values.entries()) {
            values.push(convertValue(value, useMeanValue).value);
            labels.push(formatDateYYYYMMDD(new Date(timestamp)));
        }

        return {
            type: AnalyticsChartType.LINE,
            values: values,
            labels: labels
        }
    } else {
        return {
            type: AnalyticsChartType.PIE,
            values: Object.fromEntries(bag.values.entries().map(([category, timestamps]) => {
                return [category, timestamps.values().reduce((a, b) => a + b, 0)];
            }))
        }
    }
}

export function TrackableDetailedAnalytics(id: string, rawQuestionId: string | null, trackableService: TrackableService,
    formService: FormService, settingsService: AnalyticsSettingsService, analyticsService: AnalyticsService): Readable<Promise<TrackableDetailedAnalyticsResult>> {
    return derived([analytics], ([$res], set) => {
        let promise = new Promise<TrackableDetailedAnalyticsResult>(
            async (resolve) => {
                let result = await $res;

                let trackable = await trackableService.getTrackableById(id);
                if (trackable == null) return;

                let topValues = result.rawValues.get(trackable.formId);
                if (topValues == null) return;

                let settings = await settingsService.getSettingsByForm(trackable.formId);
                if (settings == null) return;

                let form = await formService.getFormById(trackable?.formId);
                if (form == null) return;

                let questionId: string;
                if (rawQuestionId == null) {
                    questionId = settings.questionId;
                } else {
                    questionId = rawQuestionId;
                }

                let bag = topValues.get(questionId);
                if (bag == null)
                    return;

                let useMeanValue = settings.useMeanValue[questionId] ?? false;

                let basic = await analyticsService.calculateBasicAnalytics(questionId, bag, settings);
                let weekDay = await analyticsService.calculateWeekDayAnalytics(questionId, bag, settings);

                let transformedWeekDay: WeekDayAnalyticsTransformed;
                if (weekDay.quantitative) {
                    transformedWeekDay = {
                        ...weekDay, value: {
                            ...weekDay.value, values:
                                Object.fromEntries(weekDay.value.values.entries().map(([k, v]) => [WEEK_DAYS_SHORT[k], v.value]))
                        }
                    };
                } else {
                    transformedWeekDay = weekDay;
                }

                let correlations: TrackableDetailCorrelation[] = result.correlations.entries()
                    .filter(([k, v]) => k.includes(questionId) && Math.abs(v.coefficient) > 0.2)
                    .map(([key, value]) => {
                        return { key, name: convertResultKey(key, result.forms), value };
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

                resolve({
                    trackable,
                    weekDayAnalytics: transformedWeekDay,
                    basicAnalytics: basic,
                    questions: form.questions,
                    correlations,
                    chart: constructChartFromValues(bag, useMeanValue),
                    questionId
                });
            });

        set(promise);
    });
}

export function TrackableAnalytics(): Readable<Promise<TrackableAnalyticsResult[]>> {
    // derived trackables
    // derived analytics settings????

    return derived([analytics, trackables, analyticsSettings], ([$res, $trackables, $settings], set) => {
        let promise = new Promise<TrackableAnalyticsResult[]>(
            async (resolve) => {
                let result: AnalyticsResult = await $res;
                let trackableList = await $trackables;
                let allSettings = await $settings;

                let res: TrackableAnalyticsResult[] = [];
                for (let trackable of trackableList) {
                    let settings = allSettings.find(s => s.formId == trackable.formId);
                    if (settings == null) continue;

                    let formData = result.rawValues.get(trackable.formId);
                    if (formData == null) continue;

                    let mainValues = formData.get(settings.questionId);
                    if (mainValues == null) continue;

                    let useMeanValue = settings.useMeanValue[settings.questionId] ?? false;

                    res.push({
                        trackable,
                        chart: constructChartFromValues(mainValues, useMeanValue),
                        settings: settings
                    });
                }

                resolve(res);
            });

        set(promise);
    });
}
