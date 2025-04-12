import {type TextOrDynamic, type VariableTypeDef, VariableTypeName} from "@perfice/model/variable/variable";
import {ListVariableType} from "@perfice/services/variable/types/list";
import type {SimpleTimeScopeType} from "@perfice/model/variable/time/time";

export interface TableWidgetSettings {
    formId: string;
    prefix: TextOrDynamic[];
    suffix: TextOrDynamic[];
    timeScope: SimpleTimeScopeType;
    // Question id to optionally group by
    groupBy: string | null;
}

export function createTypeDefForTableWidget(settings: TableWidgetSettings): VariableTypeDef {
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
