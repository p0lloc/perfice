import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {createTypeDefForTableWidget, type TableWidgetSettings} from "@perfice/model/table/table";
import {
    type TextOrDynamic,
    type Variable,
    type VariableTypeDef,
    VariableTypeName
} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";

export interface DashboardTableWidgetSettings extends TableWidgetSettings {
}

export class DashboardTableWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.TABLE, DashboardTableWidgetSettings> {
    getType(): DashboardWidgetType.TABLE {
        return DashboardWidgetType.TABLE;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardTableWidgetSettings {
        return {
            formId: "",
            prefix: [],
            suffix: [],
            groupBy: null
        };
    }

    createDependencies(settings: DashboardTableWidgetSettings): Map<string, Variable> {
        return new Map([["list", {
            id: crypto.randomUUID(),
            name: "List",
            type: createTypeDefForTableWidget(settings)
        }]]);
    }

    updateDependencies(dependencies: Record<string, string>,
                       previousSettings: DashboardTableWidgetSettings, settings: DashboardTableWidgetSettings): Map<string, VariableTypeDef> {

        return new Map([["list", createTypeDefForTableWidget(settings)]]);
    }

}
