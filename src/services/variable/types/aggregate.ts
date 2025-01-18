import type {VariableEvaluator, VariableType} from "@perfice/model/variable/variable";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export class AggregateVariableType implements VariableType {

    evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        throw new Error("Method not implemented.");
    }
    getDependencies(): string[] {
        throw new Error("Method not implemented.");
    }
}
