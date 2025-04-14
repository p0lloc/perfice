import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {createTypeDefForTableWidget, type TableWidgetSettings} from "@perfice/model/sharedWidgets/table/table";
import {type Variable, type VariableTypeDef} from "@perfice/model/variable/variable";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {faSun, faTable, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DashboardTableWidgetSettings extends TableWidgetSettings {
}

export class DashboardTableWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.TABLE, DashboardTableWidgetSettings> {
    getType(): DashboardWidgetType.TABLE {
        return DashboardWidgetType.TABLE;
    }

    getName(): string {
        return "Table";
    }

    getIcon(): IconDefinition {
        return faTable;
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
            timeScope: SimpleTimeScopeType.DAILY,
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
