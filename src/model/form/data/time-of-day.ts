import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pNumber, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "@perfice/model/form/form";

export interface TimeOfDayFormQuestionDataSettings {
}

export class TimeOfDayFormQuestionDataType implements FormQuestionDataTypeDefinition<number, TimeOfDayFormQuestionDataSettings> {
    validate(value: number, settings: TimeOfDayFormQuestionDataSettings): string | null {
        return null;
    }

    getDefaultSettings(): TimeOfDayFormQuestionDataSettings {
        return {};
    }

    getDefaultValue(): number {
        return 8 * 60;
    }

    getPrimitiveType(): PrimitiveValueType {
        return PrimitiveValueType.NUMBER;
    }

    serialize(value: PrimitiveValue) {
        if (value.type == PrimitiveValueType.NUMBER) {
            return value.value;
        }

        return 0.0;
    }

    deserialize(value: any): PrimitiveValue | null {
        let number = parseFloat(value);
        if (isNaN(number)) {
            return null;
        }

        return pNumber(number);
    }

    getSupportedDisplayTypes(): FormQuestionDisplayType[] {
        return [FormQuestionDisplayType.INPUT];
    }

}
