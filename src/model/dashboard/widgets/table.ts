import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {
    type TextOrDynamic,
    type Variable,
    type VariableTypeDef,
    VariableTypeName
} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";

export interface DashboardTableWidgetSettings {
    formId: string;
    prefix: TextOrDynamic[];
    suffix: TextOrDynamic[];
    // Question id to optionally group by
    groupBy: string | null;
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

    private createTypeDef(settings: DashboardTableWidgetSettings): VariableTypeDef {
        let fields: Set<string> = new Set();
        [...settings.prefix, ...settings.suffix]
            .filter(v => v.dynamic)
            .forEach(v => fields.add(v.value));

        if (settings.groupBy != null) {
            fields.add(settings.groupBy);
        }

        return {
            type: VariableTypeName.LIST,
            value: new ListVariableType(settings.formId,
                Object.fromEntries(fields.entries().map(([key]) => [key, true])), [])
        };
    }

    createDependencies(settings: DashboardTableWidgetSettings): Map<string, Variable> {
        return new Map([["list", {
            id: crypto.randomUUID(),
            name: "List",
            type: this.createTypeDef(settings)
        }]]);
    }

    updateDependencies(dependencies: Record<string, string>,
                       previousSettings: DashboardTableWidgetSettings, settings: DashboardTableWidgetSettings): Map<string, VariableTypeDef> {

        return new Map([["list", this.createTypeDef(settings)]]);
    }

}
