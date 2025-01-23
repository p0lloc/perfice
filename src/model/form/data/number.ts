import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pNumber, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "@perfice/model/form/form";

export interface NumberFormQuestionDataSettings {
    min: number | null;
    max: number | null;
}

export class NumberFormQuestionDataType implements FormQuestionDataTypeDefinition<number, NumberFormQuestionDataSettings> {
    validate(value: number, settings: NumberFormQuestionDataSettings): string | null {
        if(settings.min != null && value < settings.min) {
            return `Value is too small (min ${settings.min})`;
        }

        if(settings.max != null && value > settings.max) {
            return `Value is too large (max ${settings.max})`;
        }

        return null;
    }

    getDefaultSettings(): NumberFormQuestionDataSettings {
        return {
            min: null,
            max: null
        };
    }

    getDefaultValue(): number {
        return 0;
    }

    getPrimitiveType(): PrimitiveValueType {
        return PrimitiveValueType.NUMBER;
    }

    serialize(value: PrimitiveValue) {
        if(value.type == PrimitiveValueType.NUMBER) {
            return value.value;
        }

        return 0.0;
    }

    deserialize(value: any): PrimitiveValue | null {
        let number = parseFloat(value);
        if(isNaN(number)) {
            return null;
        }

        return pNumber(number);
    }

    getSupportedDisplayTypes(): FormQuestionDisplayType[] {
        return [FormQuestionDisplayType.INPUT, FormQuestionDisplayType.RANGE, FormQuestionDisplayType.SELECT];
    }

}
