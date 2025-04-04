import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pNumber, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "@perfice/model/form/form";
import {formatTimestampHHMM} from "@perfice/util/time/format";

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


    import(value: any): PrimitiveValue | null {
        return null;
    }

    export(value: PrimitiveValue): any {
        return null;
    }

    getDisplayValue(value: number): PrimitiveValue | null {
        return pString(formatTimestampHHMM(value));
    }

}
