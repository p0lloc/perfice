import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {type Variable, type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {faBarChart, faBars, faLineChart, faPieChart} from "@fortawesome/free-solid-svg-icons";

export enum DashboardChartWidgetType {
    LINE = "line",
    PIE = "pie",
    BAR = "bar",
}

export const DASHBOARD_CHART_WIDGET_TYPES = [
    {
        value: DashboardChartWidgetType.LINE,
        name: "Line",
        icon: faLineChart
    },
    {
        value: DashboardChartWidgetType.PIE,
        name: "Pie",
        icon: faPieChart
    },
    {
        value: DashboardChartWidgetType.BAR,
        name: "Bar",
        icon: faBarChart
    }
]

export interface DashboardChartWidgetSettings {
    type: DashboardChartWidgetType;
    formId: string;
    questionId: string;
    aggregateType: AggregateType;
    timeScope: SimpleTimeScopeType;
    color: string;
    count: number;
}

export class DashboardChartWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.CHART, DashboardChartWidgetSettings> {
    getType(): DashboardWidgetType.CHART {
        return DashboardWidgetType.CHART;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardChartWidgetSettings {
        return {
            type: DashboardChartWidgetType.LINE,
            formId: "abc",
            questionId: "",
            color: "#ff0000",
            timeScope: SimpleTimeScopeType.DAILY,
            aggregateType: AggregateType.SUM,
            count: 10
        };
    }

    private createListTypeDef(settings: DashboardChartWidgetSettings): VariableTypeDef {
        return {
            type: VariableTypeName.LIST,
            value: new ListVariableType(settings.formId, {[settings.questionId]: true}, [])
        };
    }

    private createAggregateTypeDef(listVariableId: string, settings: DashboardChartWidgetSettings): VariableTypeDef {
        return {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(settings.aggregateType, listVariableId, settings.questionId)
        };
    }

    createDependencies(settings: DashboardChartWidgetSettings): Map<string, Variable> {
        let listVariableId = crypto.randomUUID();
        return new Map([
            ["list", {
                id: listVariableId,
                name: "List",
                type: this.createListTypeDef(settings)
            }],
            ["aggregate", {
                id: crypto.randomUUID(),
                name: "Aggregate",
                type: this.createAggregateTypeDef(listVariableId, settings)
            }]
        ]);
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardChartWidgetSettings, settings: DashboardChartWidgetSettings): Map<string, VariableTypeDef> {
        // No settings changed, return empty map
        if (previousSettings.formId == settings.formId
            && previousSettings.questionId == settings.questionId
            && previousSettings.aggregateType == settings.aggregateType) return new Map();

        return new Map([
            ["list", this.createListTypeDef(settings)],
            ["aggregate", this.createAggregateTypeDef(dependencies["list"], settings)]
        ]);
    }

}
