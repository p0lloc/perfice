import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {type Variable, type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {faHashtag, faTags, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DashboardMetricWidgetSettings {
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
            timeScope: SimpleTimeScopeType.DAILY
        };
    }

    createDependencies(settings: DashboardMetricWidgetSettings): Map<string, Variable> {
        const listVariableId = crypto.randomUUID();
        return new Map([
            [
                "list_variable",
                {
                    id: listVariableId,
                    name: "Metric",
                    type: {
                        type: VariableTypeName.LIST,
                        value: new ListVariableType("", {}, [])
                    }
                }
            ],

            [
                "variable",
                {
                    id: crypto.randomUUID(),
                    name: "Metric",
                    type: {
                        type: VariableTypeName.AGGREGATE,
                        value: new AggregateVariableType(AggregateType.MEAN, listVariableId, "metric")
                    }
                }
            ]
        ]);
    }

    updateDependencies(dependencies: Record<string, string>, previousSettings: DashboardMetricWidgetSettings, settings: DashboardMetricWidgetSettings): Map<string, VariableTypeDef> {
        return new Map();
    }

}
