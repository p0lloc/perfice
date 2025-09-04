import {type Variable, type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {type DashboardWidgetDefinition, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
import {faList, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DashboardEntryRowWidgetSettings {
    formId: string;
    questionId: string;
}

export class DashboardEntryRowWidgetDefinition implements DashboardWidgetDefinition<DashboardWidgetType.ENTRY_ROW, DashboardEntryRowWidgetSettings> {
    getType(): DashboardWidgetType.ENTRY_ROW {
        return DashboardWidgetType.ENTRY_ROW;
    }

    getName(): string {
        return "Entry row";
    }

    getIcon(): IconDefinition {
        return faList;
    }

    getMinHeight(): number | undefined {
        return undefined;
    }

    getMinWidth(): number | undefined {
        return undefined;
    }

    getDefaultSettings(): DashboardEntryRowWidgetSettings {
        return {
            formId: "abc",
            questionId: "",
        };
    }

    private createTypeDef(settings: DashboardEntryRowWidgetSettings): VariableTypeDef {
        return {
            type: VariableTypeName.LIST,
            value: new ListVariableType(settings.formId, {[settings.questionId]: true}, [])
        };
    }

    createDependencies(settings: DashboardEntryRowWidgetSettings): Map<string, Variable> {
        return new Map([["list", {
            id: crypto.randomUUID(),
            name: "List",
            type: this.createTypeDef(settings)
        }]]);
    }

    updateDependencies(_dependencies: Record<string, string>, previousSettings: DashboardEntryRowWidgetSettings, settings: DashboardEntryRowWidgetSettings): Map<string, VariableTypeDef> {
        return new Map([["list", this.createTypeDef(settings)]]);
    }

}