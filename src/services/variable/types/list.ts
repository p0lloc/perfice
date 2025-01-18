import type { PrimitiveValue } from "@perfice/model/primitive/primitive";
import type {VariableEvaluator, VariableType} from "@perfice/model/variable/variable";

export class ListVariableType implements VariableType {
    evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        throw new Error("Method not implemented.");
    }
    getDependencies(): string[] {
        throw new Error("Method not implemented.");
    }

}
