import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {type Variable, type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {faHashtag, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
import type {JournalEntryFilter} from "@perfice/services/variable/filtering";

export interface DashboardMetricWidgetSettings {
    aggregateType: AggregateType;
    formId: string;
    field: string;
    filters: JournalEntryFilter[];
    timeScope: SimpleTimeScopeType;
}

export class DashboardMetricWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.METRIC, DashboardMetricWidgetSettings> {
    getType(): DashboardWidgetType.METRIC {
        return DashboardWidgetType.METRIC;
    }

    getName(): string {
        return "Metric";
    }

    getIcon(): IconDefinition {
        return faHashtag;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardMetricWidgetSettings {
        return {
            timeScope: SimpleTimeScopeType.DAILY,
            formId: "",
            field: "",
            aggregateType: AggregateType.SUM,
            filters: [],
        };
    }

    createDependencies(settings: DashboardMetricWidgetSettings, dependencies?: Record<string, string>): Map<string, Variable> {
        let listVariableId = dependencies?.["list_variable"] ?? crypto.randomUUID();
        let aggregateVariableId = dependencies?.["aggregate"] ?? crypto.randomUUID();
        return new Map([
            [
                "list_variable",
                {
                    id: listVariableId,
                    name: "Metric",
                    type: {
                        type: VariableTypeName.LIST,
                        value: new ListVariableType(settings.formId, {[settings.field]: true}, settings.filters)
                    }
                }
            ],

            [
                "variable",
                {
                    id: aggregateVariableId,
                    name: "Metric",
                    type: {
                        type: VariableTypeName.AGGREGATE,
                        value: new AggregateVariableType(settings.aggregateType, listVariableId, settings.field)
                    }
                }
            ]
        ]);
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardMetricWidgetSettings, settings: DashboardMetricWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}
