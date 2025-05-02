import {derived, type Readable} from "svelte/store";
import type {Trackable} from "@perfice/model/trackable/trackable";
import {
    type AnalyticsResult,
    createDetailedCorrelations,
    type DetailCorrelation
} from "@perfice/stores/analytics/analytics";
import {
    AnalyticsService,
    type BasicAnalytics,
    type CategoricalWeekDayAnalytics,
    convertValue,
    type CorrelationResult,
    isAnalyticsSupportedQuestion,
    type QuantitativeWeekDayAnalytics,
    type ValueBag
} from "@perfice/services/analytics/analytics";
import {analytics, analyticsSettings, trackables} from "@perfice/stores";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";
import {WEEK_DAYS_SHORT} from "@perfice/util/time/format";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import type {AnalyticsSettingsService} from "@perfice/services/analytics/settings";
import type {FormService} from "@perfice/services/form/form";
import {type FormQuestion, FormQuestionDataType} from "@perfice/model/form/form";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {formatSimpleTimestamp} from "@perfice/model/variable/ui";
import {formatValueAsDataType} from "@perfice/model/form/data";

export enum AnalyticsChartType {
    LINE,
    PIE
}

export interface LineAnalyticsChartData {
    type: AnalyticsChartType.LINE,
    values: number[],
    labels: string[],
    labelFormatter: (v: number) => string
}

export type AnalyticsChartData = LineAnalyticsChartData | {
    type: AnalyticsChartType.PIE,
    values: Record<string, number>
}

export interface TrackableAnalyticsResult {
    trackable: Trackable;
    chart: AnalyticsChartData;
    settings: AnalyticsSettings;
    questions: FormQuestion[];
}

export type TrackableWeekDayAnalyticsTransformed = {
    quantitative: true,
    value: Omit<QuantitativeWeekDayAnalytics, 'values'> & {
        dataPoints: number[];
        labels: string[];
    }
} | {
    quantitative: false,
    value: CategoricalWeekDayAnalytics
}

export interface TrackableDetailedAnalyticsResult {
    trackable: Trackable;
    basicAnalytics: BasicAnalytics;
    weekDayAnalytics: TrackableWeekDayAnalyticsTransformed | null;
    chart: AnalyticsChartData;
    correlations: DetailCorrelation[];
    questions: FormQuestion[];
    questionId: string;
    questionType: FormQuestionDataType;
    timeScope: SimpleTimeScopeType;
}

function constructChartFromValues(bag: ValueBag, useMeanValue: boolean,
                                  timeScope: SimpleTimeScopeType, dataType: FormQuestionDataType): AnalyticsChartData {
    if (bag.quantitative) {
        let values = [];
        let labels = [];

        let sorted = bag.values
            .entries()
            .toArray()
            .sort(([firstTimestamp], [secondTimestamp]) => firstTimestamp - secondTimestamp);
        for (let [timestamp, value] of sorted) {
            values.push(convertValue(value, useMeanValue).value);
            labels.push(formatSimpleTimestamp(timestamp, timeScope));
        }

        return {
            type: AnalyticsChartType.LINE,
            values: values,
            labels: labels,
            labelFormatter: (v: number) => formatValueAsDataType(v, dataType)
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

function createDetailedPromise(id: string, rawQuestionId: string | null,
                               timeScope: SimpleTimeScopeType,
                               res: Promise<AnalyticsResult>,
                               trackableService: TrackableService, formService: FormService, settingsService: AnalyticsSettingsService,
                               analyticsService: AnalyticsService) {
    return new Promise<TrackableDetailedAnalyticsResult>(
        async (resolve) => {
            let result = await res;

            let trackable = await trackableService.getTrackableById(id);
            if (trackable == null) return;

            let valuesByTimeScope = result.rawValues.get(timeScope);
            if (valuesByTimeScope == null) return;

            let topValues = valuesByTimeScope.get(trackable.formId);
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

            let formQuestion = form.questions.find(q => q.id == questionId);
            if (formQuestion == null) return;

            let bag = topValues.get(questionId);
            if (bag == null) {
                // Trackable has incompatible question, try to find first compatible question
                for (let question of form.questions) {
                    bag = topValues.get(question.id);
                    if (bag != null) {
                        questionId = question.id;
                        break;
                    }
                }

                // No compatible question found, skip this trackable
                if (bag == null) {
                    return;
                }
            }

            let useMeanValue = settings.useMeanValue[questionId] ?? true;
            let basicAnalytics = result.basicAnalytics
                .get(timeScope)
                ?.get(trackable.formId)
                ?.get(questionId);

            if (basicAnalytics == null) return;

            let transformedWeekDay: TrackableWeekDayAnalyticsTransformed | null;
            if (timeScope == SimpleTimeScopeType.DAILY) {
                let weekDay = await analyticsService.calculateFormWeekDayAnalytics(questionId, bag, settings);

                if (weekDay.quantitative) {
                    transformedWeekDay = {
                        ...weekDay, value: {
                            ...weekDay.value,

                            labels: weekDay.value.values.keys().map(v => WEEK_DAYS_SHORT[v]).toArray(),
                            dataPoints: weekDay.value.values.values().map(v => v.value).toArray(),
                        }
                    };
                } else {
                    transformedWeekDay = weekDay;
                }
            } else {
                transformedWeekDay = null;
            }

            let correlations = result.correlations.get(timeScope) ?? new Map<string, CorrelationResult>();

            // Only show questions in the UI that we can actually analyze
            let supportedQuestions = form.questions.filter(q => isAnalyticsSupportedQuestion(q));

            resolve({
                trackable,
                weekDayAnalytics: transformedWeekDay,
                basicAnalytics,
                questions: supportedQuestions,
                correlations: createDetailedCorrelations(correlations, result, questionId, timeScope),
                chart: constructChartFromValues(bag, useMeanValue, timeScope, formQuestion.dataType),
                questionId,
                questionType: formQuestion.dataType,
                timeScope
            });
        });
}

export function TrackableDetailedAnalytics(id: string, rawQuestionId: string | null,
                                           timeScope: SimpleTimeScopeType,
                                           trackableService: TrackableService,
                                           formService: FormService, settingsService: AnalyticsSettingsService,
                                           analyticsService: AnalyticsService): Readable<Promise<TrackableDetailedAnalyticsResult>> {
    /*
        if (timeScope != SimpleTimeScopeType.DAILY) {
            // Differing time scope requires a new analytics result
            return readable(createPromise(id, rawQuestionId, timeScope, analytics.getSpecificAnalytics(new Date(), 30, 5), trackableService,
                formService, settingsService, analyticsService));
        } else {
            */
    // Use cached value from analytics store
    return derived([analytics], ([$res], set) => {
        set(createDetailedPromise(id, rawQuestionId, timeScope, $res, trackableService,
            formService, settingsService, analyticsService));
    });
}

export function TrackableAnalytics(): Readable<Promise<TrackableAnalyticsResult[]>> {
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

                    let valuesByTimeScope = result.rawValues.get(SimpleTimeScopeType.DAILY);
                    if (valuesByTimeScope == null) return;

                    let formData = valuesByTimeScope.get(trackable.formId);
                    if (formData == null) continue;

                    let form = result.forms.find(f => f.id == trackable.formId);
                    if (form == null) continue;

                    let mainValues = formData.get(settings.questionId);
                    if (mainValues == null) {
                        // If trackable has incompatible question, still include it so that the user can update the question
                        res.push({
                            trackable,
                            chart: {
                                type: AnalyticsChartType.LINE,
                                values: [],
                                labelFormatter: (v: number) => "",
                                labels: []
                            },
                            settings: settings,
                            questions: form.questions
                        });
                        continue;
                    }

                    let formQuestion = form.questions.find(q => q.id == settings.questionId);
                    if (formQuestion == null) continue;

                    let useMeanValue = settings.useMeanValue[settings.questionId] ?? true;

                    res.push({
                        trackable,
                        chart: constructChartFromValues(mainValues, useMeanValue, SimpleTimeScopeType.DAILY, formQuestion.dataType),
                        settings: settings,
                        questions: form.questions
                    });
                }

                resolve(res);
            });

        set(promise);
    });
}
