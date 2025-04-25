import {type VariableEvaluator, type VariableType, VariableTypeName} from "@perfice/model/variable/variable";
import {pMap, pNumber, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {extractValueFromDisplay} from "@perfice/services/variable/types/list";

export enum AggregateType {
    COUNT = "COUNT",
    SUM = "SUM",
    MEAN = "MEAN",
}

export function extractNumbers(list: PrimitiveValue[]): number[] {
    let result: number[] = [];
    for (let val of list) {
        let value: PrimitiveValue = extractValueFromDisplay(val);
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
            if (val.type == PrimitiveValueType.JOURNAL_ENTRY) {
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

    private evaluateList(list: PrimitiveValue[]): PrimitiveValue {
        if (list.length == 0)
            return pNumber(0.0);

        if (list[0].type == PrimitiveValueType.JOURNAL_ENTRY) {
            list = this.flattenEntryList(list);
        }

        let numbers = extractNumbers(list);

        switch (this.aggregateType) {
            case AggregateType.COUNT: {
                return pNumber(list.length);
            }
            case AggregateType.SUM: {
                return pNumber(sumNumbers(numbers));
            }
            case AggregateType.MEAN: {
                let sum = sumNumbers(numbers);
                return pNumber(sum / numbers.length);
            }
        }
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let value = await evaluator.evaluateVariable(this.listVariableId);

        switch (value.type) {
            case PrimitiveValueType.LIST:
                return this.evaluateList(value.value);
            case PrimitiveValueType.MAP:
                let result: Record<string, PrimitiveValue> = {};
                for (let [key, val] of Object.entries(value.value)) {
                    if (val.type != PrimitiveValueType.LIST) continue;

                    result[key] = this.evaluateList(val.value);
                }

                return pMap(result);
            default:
                return pNumber(0.0);
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
