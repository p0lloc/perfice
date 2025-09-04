import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, type Readable} from "svelte/store";
import {VariableValueStore} from "@perfice/stores/variable/value";
import {
    comparePrimitives,
    pDisplay,
    prettyPrintPrimitive,
    type PrimitiveValue,
    PrimitiveValueType,
    pString
} from "@perfice/model/primitive/primitive";
import {formatAnswersIntoRepresentation} from "@perfice/model/trackable/ui";
import {extractValueFromDisplay} from "@perfice/services/variable/types/list";
import type {TableWidgetSettings} from "@perfice/model/sharedWidgets/table/table";
import {formatDateLongTermOrHHMM} from "@perfice/util/time/format";
import {forms} from "@perfice/stores";

export interface TableWidgetResult {
    name: string;
    icon: string;
    groups: TableWidgetGroup[];
}

export interface TableWidgetGroup {
    group: PrimitiveValue | null;
    name: string;
    entries: TableWidgetEntry[];
}

export interface TableWidgetEntry {
    prefix: string;
    suffix: string;
}

function addTableWidgetEntryFromAnswers(groups: TableWidgetGroup[], answers: Record<string, PrimitiveValue>, settings: TableWidgetSettings) {
    let prefix = formatAnswersIntoRepresentation(answers, settings.prefix);
    let suffix = formatAnswersIntoRepresentation(answers, settings.suffix);

    let entry: TableWidgetEntry = {
        prefix,
        suffix,
    }

    if (settings.groupBy != null) {
        let groupAnswer = answers[settings.groupBy];
        if (groupAnswer == null) return;

        let groupAnswerValue = extractValueFromDisplay(groupAnswer);

        let existing = groups.find(g =>
            g.group != null && comparePrimitives(g.group, groupAnswerValue));

        if (existing == null) {
            groups.push({
                group: groupAnswerValue,
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

export function formatTimestampForTable(timestamp: number, date: Date, weekStart: WeekStart): PrimitiveValue {
    let formatted = formatDateLongTermOrHHMM(new Date(timestamp), date, weekStart);
    return pDisplay(pString(formatted), pString(formatted));
}

export function TableWidget(variableId: string, settings: TableWidgetSettings, date: Date,
                            weekStart: WeekStart, key: string, variableService: VariableService,
                            extraAnswers: Record<string, PrimitiveValue>[] = []): Readable<Promise<TableWidgetResult>> {

    let store = VariableValueStore(variableId,
        tSimple(settings.timeScope ?? SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key, false);

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

            // Add answers from actual journal entries
            for (let primitive of resolved.value) {
                if (primitive.type != PrimitiveValueType.JOURNAL_ENTRY) continue;

                let answers = {
                    ...primitive.value.value, timestamp:
                        formatTimestampForTable(primitive.value.timestamp, date, weekStart)
                };
                addTableWidgetEntryFromAnswers(groups, answers, settings);
            }

            // Add any extra answers
            extraAnswers.forEach(answers =>
                addTableWidgetEntryFromAnswers(groups, answers, settings));

            resolve({
                name: form.name,
                icon: form.icon,
                groups
            })
        }));
    });
}
