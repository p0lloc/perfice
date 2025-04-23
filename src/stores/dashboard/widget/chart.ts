import {SimpleTimeScope, SimpleTimeScopeType, TimeScopeType, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, type Readable} from "svelte/store";
import {type DashboardChartWidgetSettings, DashboardChartWidgetType} from "@perfice/model/dashboard/widgets/chart";
import {RangedVariableValueStore, VariableValueStore} from "@perfice/stores/variable/value";
import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {getChartColors} from "@perfice/util/color";
import {formatValueAsDataType} from "@perfice/model/form/data";
import {offsetDateByTimeScope} from "@perfice/util/time/simple";
import {formatSimpleTimestamp} from "@perfice/model/variable/ui";
import {forms} from "@perfice/stores";

export interface ChartWidgetResult {
    chartType: DashboardChartWidgetType,
    dataPoints: number[];
    labels: string[];
    name: string;
    fillColor: string;
    borderColor: string;
    labelFormatter: (v: number) => string;
}

export function ChartWidget(dependencies: Record<string, string>, settings: DashboardChartWidgetSettings, date: Date,
                            weekStart: WeekStart, key: string, variableService: VariableService): Readable<Promise<ChartWidgetResult>> {

    const variableId = dependencies["aggregate"];

    // Delete notifications is set to false, since we don't want to run this callback when the internal variable changes
    // It will have values for potentially different form/questions, even though the "settings" field has not updated yet.

    let store: Readable<Promise<PrimitiveValue | PrimitiveValue[]>>;
    let scope = new SimpleTimeScope(settings.timeScope ?? SimpleTimeScopeType.DAILY, weekStart, date.getTime());
    if (settings.groupBy != null) {
        store = VariableValueStore(variableId, {type: TimeScopeType.SIMPLE, value: scope}, variableService, key, false);
    } else {
        store = RangedVariableValueStore(variableId,
            scope, variableService, key, settings.count, false);
    }

    return derived(store, (value, set) => {
        set(new Promise(async (resolve) => {
            let form = await forms.getFormById(settings.formId);
            if (form == null) return;

            let question = form.questions.find(q => q.id == settings.questionId);
            if (question == null) return;

            let resolved = await value;

            let dataPoints: number[] = [];
            let labels: string[] = [];
            if (Array.isArray(resolved)) {
                for (let i = resolved.length - 1; i >= 0; i--) {
                    let primitive = resolved[i];
                    if (primitive.type != PrimitiveValueType.NUMBER) continue;
                    dataPoints.push(primitive.value);

                    let offseted = offsetDateByTimeScope(date, settings.timeScope, -i)
                    labels.push(formatSimpleTimestamp(offseted.getTime(), settings.timeScope, true));
                }
            } else {
                if (resolved.type != PrimitiveValueType.MAP) return;

                for (let [label, pointValue] of Object.entries(resolved.value)) {
                    if (pointValue.type != PrimitiveValueType.NUMBER) continue;
                    labels.push(label);
                    dataPoints.push(pointValue.value);

                }
            }

            const {fillColor, borderColor} = getChartColors(settings.color);

            resolve({
                chartType: settings.type,
                dataPoints,
                name: form.name,
                labels: labels,
                fillColor,
                borderColor,
                labelFormatter: (v: number) => v != null ? formatValueAsDataType(v, question.dataType) : v
            });
        }));
    });
}