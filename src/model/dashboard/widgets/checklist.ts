import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {type Variable, type VariableTypeDef} from "@perfice/model/variable/variable";
import {
    type ChecklistWidgetSettings, createChecklistDependencies
} from "@perfice/model/sharedWidgets/checklist/checklist";
import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {faCheckCircle, faMagnifyingGlass, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DashboardChecklistWidgetSettings extends ChecklistWidgetSettings {
}

export class DashboardChecklistWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.CHECKLIST, DashboardChecklistWidgetSettings> {
    getType(): DashboardWidgetType.CHECKLIST {
        return DashboardWidgetType.CHECKLIST;
    }


    getName(): string {
        return "Checklist";
    }

    getIcon(): IconDefinition {
        return faCheckCircle;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardChecklistWidgetSettings {
        return {
            conditions: [],
            timeScope: SimpleTimeScopeType.DAILY
        };
    }

    createDependencies(settings: DashboardChecklistWidgetSettings): Map<string, Variable> {
        let map: Map<string, Variable> = new Map();
        let typeDefs = createChecklistDependencies(settings);
        for (let [key, value] of typeDefs) {
            map.set(key, {
                id: crypto.randomUUID(),
                name: "Checklist",
                type: value
            });
        }

        return map;
    }

    updateDependencies(_dependencies: Record<string, string>, _previousSettings: DashboardChecklistWidgetSettings, settings: DashboardChecklistWidgetSettings): Map<string, VariableTypeDef> {
        return createChecklistDependencies(settings);
    }

}
