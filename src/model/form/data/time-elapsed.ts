import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pNumber, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "../form";

export interface TimeElapsedFormQuestionDataSettings {
}


export class TimeElapsedFormQuestionDataType implements FormQuestionDataTypeDefinition<number, TimeElapsedFormQuestionDataSettings> {
    validate(value: number, settings: TimeElapsedFormQuestionDataSettings): string | null {
        if(value < 0) {
            return "Duration cannot be negative";
        }

        return null;
    }

    getDefaultSettings(): TimeElapsedFormQuestionDataSettings {
        return {};
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
        return [FormQuestionDisplayType.INPUT];
    }


    import(value: any): PrimitiveValue | null {
        return null;
    }

    export(value: PrimitiveValue): any {
        return null;
    }

}
