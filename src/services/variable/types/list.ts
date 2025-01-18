import type { JournalEntry } from "@perfice/model/journal/journal";
import {
    pEntry,
    pList,
    type PrimitiveValue,
    PrimitiveValueType,
} from "@perfice/model/primitive/primitive";
import {type VariableEvaluator, type VariableType, VariableTypeName} from "@perfice/model/variable/variable";

export function extractRawValue(p: PrimitiveValue): PrimitiveValue {
    if (p.type == PrimitiveValueType.DISPLAY) {
        return p.value.value;
    }

    return p;
}

export function extractFieldsFromAnswers(answers: Record<string, PrimitiveValue>, def: Record<string, boolean>): Record<string, PrimitiveValue> {
    let result: Record<string, PrimitiveValue> = {};
    for (let [key, display] of Object.entries(def)) {
        let answer = answers[key];
        if (answer == undefined)
            continue;

        result[key] = display ? answer : extractRawValue(answer);
    }

    return result;
}

export class ListVariableType implements VariableType {

    private readonly formId: string;
    private readonly fields: Record<string, boolean>;

    constructor(formId: string, fields: Record<string, boolean>) {
        this.formId = formId;
        this.fields = fields;
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let entries = await evaluator.getEntriesInTimeRange(this.formId);
        return pList(entries.map((e: JournalEntry) =>
            pEntry(e.id, e.timestamp, extractFieldsFromAnswers(e.answers, this.fields))));
    }

    getDependencies(): string[] {
        return [];
    }

    getFormId(): string {
        return this.formId;
    }

    getFields(): Record<string, boolean> {
        return this.fields;
    }

    getType(): VariableTypeName {
        return VariableTypeName.LIST;
    }

}
