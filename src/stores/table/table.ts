import type {DashboardTableWidgetSettings} from "@perfice/model/dashboard/widgets/table";
import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, type Readable} from "svelte/store";
import {VariableValueStore} from "@perfice/stores/variable/value";
import {forms} from "@perfice/app";
import {prettyPrintPrimitive, primitiveAsString, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {formatAnswersIntoRepresentation} from "@perfice/model/trackable/ui";
import {extractValueFromDisplay} from "@perfice/services/variable/types/list";
import type {TableWidgetSettings} from "@perfice/model/table/table";

export interface TableWidgetResult {
    name: string;
    icon: string;
    groups: TableWidgetGroup[];
}

export interface TableWidgetGroup {
    group: string | null;
    name: string;
    entries: TableWidgetEntry[];
}

export interface TableWidgetEntry {
    prefix: string;
    suffix: string;
}

export function TableWidget(variableId: string, settings: TableWidgetSettings, date: Date,
                            weekStart: WeekStart, key: string, variableService: VariableService): Readable<Promise<TableWidgetResult>> {

    let store = VariableValueStore(variableId,
        tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key, false);

    return derived(store, (value, set) => {
        set(new Promise(async (resolve) => {
            let form = await forms.getFormById(settings.formId);
            if (form == null) return;

            let resolved = await value;
            if (resolved.type != PrimitiveValueType.LIST) return;

            let groups: TableWidgetGroup[] = [];
            if (settings.groupBy == null) {
                groups.push({
                    group: null,
                    name: "",
                    entries: []
                });
            }

            for (let primitive of resolved.value) {
                if (primitive.type != PrimitiveValueType.JOURNAL_ENTRY) continue;

                let answers = primitive.value.value;
                let prefix = formatAnswersIntoRepresentation(answers, settings.prefix);
                let suffix = formatAnswersIntoRepresentation(answers, settings.suffix);

                let entry: TableWidgetEntry = {
                    prefix,
                    suffix,
                }

                if (settings.groupBy != null) {
                    let groupAnswer = answers[settings.groupBy];
                    if (groupAnswer == null) continue;

                    let groupAnswerStr = primitiveAsString(extractValueFromDisplay(groupAnswer));

                    let existing = groups.find(g =>
                        g.group == groupAnswerStr);

                    if (existing == null) {
                        groups.push({
                            group: groupAnswerStr,
                            name: prettyPrintPrimitive(groupAnswer),
                            entries: [entry]
                        });
                    } else {
                        existing.entries.push(entry);
                    }
                } else {
                    groups[0].entries.push(entry);
                }
            }

            resolve({
                name: form.name,
                icon: form.icon,
                groups
            })
        }));
    });
}
