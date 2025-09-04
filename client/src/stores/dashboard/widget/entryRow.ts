import {prettyPrintPrimitive, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {derived, type Readable} from "svelte/store";
import {VariableValueStore} from "@perfice/stores/variable/value";
import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {type FormQuestion, FormQuestionDisplayType} from "@perfice/model/form/form";
import type {DashboardEntryRowWidgetSettings} from "@perfice/model/dashboard/widgets/entryRow";
import {forms} from "@perfice/stores";

export interface EntryRowWidgetEntry {
    id: string;
    timestamp: number;
    icon: boolean;
    value: string;
}

export interface EntryRowWidgetResult {
    name: string;
    icon: string;
    entries: EntryRowWidgetEntry[];
}

function extractIconFromQuestion(value: string, question: FormQuestion): [string, boolean] {
    if (question.displayType != FormQuestionDisplayType.SELECT) {
        return [value, false];
    }

    let option = question.displaySettings.options.find(o => o.text == value);
    if (option != null && option.icon != null) {
        value = option.icon;
        return [option.icon, true];
    }

    return [value, false];
}

export function EntryRowWidget(dependencies: Record<string, string>, settings: DashboardEntryRowWidgetSettings, date: Date,
                               weekStart: WeekStart, key: string, variableService: VariableService): Readable<Promise<EntryRowWidgetResult>> {
    const variableId = dependencies["list"];

    // Delete notifications is set to false, since we don't want to run this callback when the internal variable changes
    // It will have values for potentially different form/questions, even though the "settings" field has not updated yet.
    let store = VariableValueStore(variableId,
        tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key, false);

    return derived(store, (value, set) => {
        set(new Promise(async (resolve) => {
            let form = await forms.getFormById(settings.formId);
            if (form == null) return;

            let question = form.questions.find(q => q.id == settings.questionId);
            if (question == null) return;

            let resolved = await value;
            if (resolved.type != PrimitiveValueType.LIST) return;

            let entries: EntryRowWidgetEntry[] = [];
            for (let primitive of resolved.value) {
                if (primitive.type != PrimitiveValueType.JOURNAL_ENTRY) continue;

                let icon = false;
                let value = prettyPrintPrimitive(primitive.value.value[settings.questionId]);

                [value, icon] = extractIconFromQuestion(value, question);

                entries.push({
                    id: primitive.value.id,
                    timestamp: primitive.value.timestamp,
                    value,
                    icon
                });
            }
            resolve({
                entries,
                name: form.name,
                icon: form.icon,
            });
        }));
    });
}