import type { PrimitiveValue } from "@perfice/model/primitive/primitive";
import {type VariableEvaluator, type VariableType, VariableTypeName} from "@perfice/model/variable/variable";

export class ListVariableType implements VariableType {

    private readonly formId: string;
    private readonly fields: Record<string, boolean>;

    constructor(formId: string, fields: Record<string, boolean>) {
        this.formId = formId;
        this.fields = fields;
    }

    evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        throw new Error("Method not implemented.");
    }
    getDependencies(): string[] {
        throw new Error("Method not implemented.");
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
