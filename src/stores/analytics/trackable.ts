import {derived, type Readable} from "svelte/store";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {AnalyticsResult} from "@perfice/stores/analytics/analytics";
import {convertValue, type TimestampedValue, type ValueBag} from "@perfice/services/analytics/analytics";
import {analyticsSettings, trackables} from "@perfice/main";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";

export enum AnalyticsChartType {
    LINE,
    PIE
}

export type AnalyticsChartData = {
    type: AnalyticsChartType.LINE,
    values: TimestampedValue<number>[]
} | {
    type: AnalyticsChartType.PIE,
    values: Record<string, number>
}

export interface TrackableAnalyticsResult {
    trackable: Trackable;
    chart: AnalyticsChartData;
    settings: AnalyticsSettings;
}

function constructChartFromValues(value: ValueBag, useMeanValue: boolean): AnalyticsChartData {
    if (value.quantitative) {
        return {
            type: AnalyticsChartType.LINE,
            values: value.values.entries().map(([timestamp, value]) => {
                return {
                    timestamp,
                    value: convertValue(value, useMeanValue).value,
                }
            }).toArray()
        }
    } else {
        return {
            type: AnalyticsChartType.PIE,
            values: Object.fromEntries(value.values.entries().map(([category, timestamps]) => {
                return [category, timestamps.values().reduce((a, b) => a + b, 0)];
            }))
        }
    }
}

export function TrackableAnalytics(result: AnalyticsResult): Readable<Promise<TrackableAnalyticsResult[]>> {
    // derived trackables
    // derived analytics settings????

    return derived([trackables, analyticsSettings], ([$trackables, $settings], set) => {
        let promise = new Promise<TrackableAnalyticsResult[]>(
            async (resolve) => {
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
