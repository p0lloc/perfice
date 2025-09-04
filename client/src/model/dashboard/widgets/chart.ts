import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {type Variable, type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {faBarChart, faLineChart, faPieChart, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {GroupVariableType} from "@perfice/services/variable/types/group";

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
    groupBy: string | null;
    title: string | null;
    aggregateType: AggregateType;
    timeScope: SimpleTimeScopeType;
    color: string;
    count: number;
}

export class DashboardChartWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.CHART, DashboardChartWidgetSettings> {
    getType(): DashboardWidgetType.CHART {
        return DashboardWidgetType.CHART;
    }

    getName(): string {
        return "Chart";
    }

    getIcon(): IconDefinition {
        return faLineChart;
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
            groupBy: null,
            color: "#ff0000",
            title: null,
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

    private createGroupTypeDef(settings: DashboardChartWidgetSettings, groupBy: string): VariableTypeDef {
        return {
            type: VariableTypeName.GROUP,
            value: new GroupVariableType(settings.formId, {[settings.questionId]: true}, groupBy, [])
        };
    }

    private createAggregateTypeDef(listVariableId: string, settings: DashboardChartWidgetSettings): VariableTypeDef {
        return {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(settings.aggregateType, listVariableId, settings.questionId)
        };
    }

    createDependencies(settings: DashboardChartWidgetSettings, dependencies?: Record<string, string>): Map<string, Variable> {
        const dependencyName = settings.groupBy != null ? "group" : "list";
        let listVariableId = dependencies?.[dependencyName] ?? crypto.randomUUID();
        let aggregateVariableId = dependencies?.["aggregate"] ?? crypto.randomUUID();

        let map: Map<string, Variable> = new Map();
        if (settings.groupBy == null) {
            map.set(dependencyName, {
                id: listVariableId,
                name: "List",
                type: this.createListTypeDef(settings)
            });
        } else {
            map.set(dependencyName, {
                id: listVariableId,
                name: "Group",
                type: this.createGroupTypeDef(settings, settings.groupBy)
            });
        }

        map.set("aggregate", {
            id: aggregateVariableId,
            name: "Aggregate",
            type: this.createAggregateTypeDef(listVariableId, settings)
        });

        return map;
    }

    updateDependencies(_dependencies: Record<string, string>, _previousSettings: DashboardChartWidgetSettings, settings: DashboardChartWidgetSettings): Map<string, VariableTypeDef> {
        return new Map(this.createDependencies(settings)
            .entries()
            .map(([key, value]) => [key, value.type]));
    }

}
