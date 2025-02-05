import {
    type VariableEvaluator,
    type VariableType,
    VariableTypeName
} from "@perfice/model/variable/variable";
import {pNumber, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";

export enum AggregateType {
    SUM = "SUM",
    MEAN = "MEAN",
}

export function extractNumbers(list: PrimitiveValue[]): number[] {
    let result: number[] = [];
    for (let val of list) {
        let value: PrimitiveValue = val;
        if (val.type == PrimitiveValueType.DISPLAY) {
            // Extract value if of type display
            value = val.value.value;
        }

        if (value.type != PrimitiveValueType.NUMBER) continue;

        result.push(value.value);
    }
    return result;
}

function sumNumbers(list: number[]): number {
    let sum = 0;
    for (let val of list) {
        sum += val;
    }

    return sum;
}

export class AggregateVariableType implements VariableType {

    private readonly aggregateType: AggregateType;
    private readonly listVariableId: string;
    private readonly field: string;

    constructor(aggregateType: AggregateType, listVariableId: string, field: string) {
        this.aggregateType = aggregateType;
        this.listVariableId = listVariableId;
        this.field = field;
    }

    private flattenEntryList(list: PrimitiveValue[]): PrimitiveValue[] {
        let result: PrimitiveValue[] = [];
        for (let val of list) {
            if (val.type == PrimitiveValueType.ENTRY) {
                let map = val.value.value;
                // Fetch the field from the answer map
                let fieldValue = map[this.field];
                if (fieldValue != null) {
                    result.push(fieldValue);
                }
            }
        }

        return result;
    }


    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let value = await evaluator.evaluateVariable(this.listVariableId);
        if (value.type != PrimitiveValueType.LIST)
            return pNumber(0.0);

        let list = value.value;
        if (list.length == 0)
            return pNumber(0.0);

        if (list[0].type == PrimitiveValueType.ENTRY) {
            list = this.flattenEntryList(list);
        }

        let numbers = extractNumbers(list);

        switch (this.aggregateType) {
            case AggregateType.SUM: {
                return pNumber(sumNumbers(numbers));
            }
            case AggregateType.MEAN: {
                let sum = sumNumbers(numbers);
                return pNumber(sum / numbers.length);
            }
        }
    }

    getDependencies(): string[] {
        return [this.listVariableId];
    }

    getType(): VariableTypeName {
        return VariableTypeName.AGGREGATE;
    }

    getAggregateType(): AggregateType {
        return this.aggregateType;
    }

    getListVariableId(): string {
        return this.listVariableId;
    }

    getField(): string {
        return this.field;
    }

}
