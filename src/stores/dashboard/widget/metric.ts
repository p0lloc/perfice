import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, type Readable} from "svelte/store";
import {VariableValueStore} from "@perfice/stores/variable/value";
import {VariableTypeName} from "@perfice/model/variable/variable";
import {formatValueAsDataType} from "@perfice/model/form/data";
import type {DashboardMetricWidgetSettings} from "@perfice/model/dashboard/widgets/metric";
import {forms} from "@perfice/stores";

export interface MetricWidgetResult {
    value: string;
    name: string;
    icon: string;
    timeScope: SimpleTimeScopeType;
}

export function MetricWidget(dependencies: Record<string, string>, settings: DashboardMetricWidgetSettings, date: Date,
                             weekStart: WeekStart, key: string, variableService: VariableService): Readable<Promise<MetricWidgetResult>> {

    let store = VariableValueStore(dependencies["variable"],
        tSimple(settings.timeScope, weekStart, date.getTime()), variableService, key);

    return derived(store, (value, set) => {
        set(new Promise(async (resolve) => {

            let listVariable = variableService.getVariableById(dependencies["list_variable"]);
            if (listVariable == null || listVariable.type.type != VariableTypeName.LIST) return;

            let aggregateVariable = variableService.getVariableById(dependencies["variable"]);
            if (aggregateVariable == null || aggregateVariable.type.type != VariableTypeName.AGGREGATE) return;

            let aggregateField = aggregateVariable.type.value.getField();

            let form = await forms.getFormById(listVariable.type.value.getFormId());
            if (form == null) return;

            let question = form.questions.find(q => q.id == aggregateField);
            if (question == null) return;

            let resolved = await value;
            resolve({
                icon: form.icon,
                name: form.name,
                value: formatValueAsDataType(resolved.value, question.dataType),
                timeScope: settings.timeScope,
            });
        }));
    });
}