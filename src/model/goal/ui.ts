import {PrimitiveValueType, type PrimitiveValue, primitiveAsNumber} from "../primitive/primitive";

export interface ConditionProgress {
    first: number;
    second: number;
    progress: number;
}

export function getGoalConditionProgress(value: PrimitiveValue): ConditionProgress {
    if (value.type == PrimitiveValueType.BOOLEAN) {
        return {first: 0, second: 0, progress: value.value ? 100 : 0};
    }

    if (value.type == PrimitiveValueType.COMPARISON_RESULT) {
        let first = primitiveAsNumber(value.value.source);
        let second = primitiveAsNumber(value.value.target);

        if (second == 0) return {first: 0, second: 0, progress: 0};

        return {first, second, progress: (first / second) * 100};
    }

    return {first: 0, second: 0, progress: 0};
}
