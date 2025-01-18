import {type VariableEvaluator, type VariableType, VariableTypeName} from "@perfice/model/variable/variable";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export enum AggregateType {
    SUM = "SUM",
    MEAN = "MEAN",
}

export class AggregateVariableType implements VariableType {

    private readonly aggregateType: AggregateType;
    private readonly listVariableId: string;

    constructor(aggregateType: AggregateType, listVariableId: string) {
        this.aggregateType = aggregateType;
        this.listVariableId = listVariableId;
    }

    evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        throw new Error("Method not implemented.");
    }
    getDependencies(): string[] {
        throw new Error("Method not implemented.");
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

}
