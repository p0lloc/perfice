import {SimpleTimeScope, SimpleTimeScopeType, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, type Readable} from "svelte/store";
import {type DashboardChartWidgetSettings, DashboardChartWidgetType} from "@perfice/model/dashboard/widgets/chart";
import {RangedVariableValueStore} from "@perfice/stores/variable/value";
import {forms} from "@perfice/main";
import {PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {getChartColors} from "@perfice/util/color";
import {formatValueAsDataType} from "@perfice/model/form/data";
import {offsetDateByTimeScope} from "@perfice/util/time/simple";
import {formatSimpleTimestamp} from "@perfice/model/variable/ui";

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
    let store = RangedVariableValueStore(variableId,
        new SimpleTimeScope(settings.timeScope ?? SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key, settings.count, false);

    return derived(store, (value, set) => {
        set(new Promise(async (resolve) => {
            let form = await forms.getFormById(settings.formId);
            if (form == null) return;

            let question = form.questions.find(q => q.id == settings.questionId);
            if (question == null) return;

            let resolved = await value;
            let dataPoints: number[] = [];
            let labels: string[] = [];
            for (let i = resolved.length - 1; i >= 0; i--) {
                let primitive = resolved[i];
                if (primitive.type != PrimitiveValueType.NUMBER) continue;
                dataPoints.push(primitive.value);

                let offseted = offsetDateByTimeScope(date, settings.timeScope, -i)
                labels.push(formatSimpleTimestamp(offseted.getTime(), settings.timeScope, true));
            }

            const {fillColor, borderColor} = getChartColors(settings.color);

            resolve({
                chartType: settings.type,
                dataPoints,
                name: form.name,
                labels: labels,
                fillColor,
                borderColor,
                labelFormatter: (v: number) => formatValueAsDataType(v, question.dataType)
            });
        }));
    });
}