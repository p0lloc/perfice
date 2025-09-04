import {PrimitiveValueType, type PrimitiveValue, primitiveAsNumber, pNumber} from "@perfice/model/primitive/primitive";
import {VariableTypeName, type VariableEvaluator, type VariableType} from "@perfice/model/variable/variable";
import type {ConstantOrVariable} from "@perfice/services/variable/types/goal";

export enum CalculationOperator {
    PLUS = "PLUS",
    MINUS = "MINUS",
    MULTIPLY = "MULTIPLY",
    DIVIDE = "DIVIDE",
}

export type CalculationEntry = CalculationOperator | ConstantOrVariable;

export class CalculationVariableType implements VariableType {
    private readonly entries: CalculationEntry[];

    constructor(entries: CalculationEntry[]) {
        this.entries = entries;
    }

    private async getValue(entry: ConstantOrVariable, evaluator: VariableEvaluator): Promise<number> {
        if (entry.constant || entry.value.type != PrimitiveValueType.STRING) {
            return primitiveAsNumber(entry.value);
        }

        let evaluated = await evaluator.evaluateVariable(entry.value.value);
        return primitiveAsNumber(evaluated);
    }

    private calculate(first: number, operator: CalculationOperator, second: number): number {
        switch (operator) {
            case CalculationOperator.PLUS:
                return first + second;
            case CalculationOperator.MINUS:
                return first - second;
            case CalculationOperator.MULTIPLY:
                return first * second;
            case CalculationOperator.DIVIDE:
                if(second == 0) return 0;
                return first / second;
        }
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let operator: CalculationOperator | undefined = undefined;
        let result: number = 0;
        for (let entry of this.entries) {
            if (typeof entry == "object") {
                let value = await this.getValue(entry, evaluator);
                if (operator != null) {
                    result = this.calculate(result, operator, value);
                } else {
                    result = value;
                }
            } else {
                operator = entry;
            }
        }

        return pNumber(result);
    }

    getDependencies(): string[] {
        let dependencies: string[] = [];
        for (let entry of this.entries) {
            if (typeof entry == "object" && !entry.constant && entry.value.type == PrimitiveValueType.STRING) {
                dependencies.push(entry.value.value ?? "");
            }
        }

        return dependencies;
    }

    getType(): VariableTypeName {
        return VariableTypeName.CALCULATION;
    }

    getEntries(): CalculationEntry[] {
        return this.entries;
    }
}
