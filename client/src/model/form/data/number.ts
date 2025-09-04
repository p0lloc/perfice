import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pNumber, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "@perfice/model/form/form";
import {numberToMaxDecimals} from "@perfice/util/math";
import {faHashtag, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface NumberFormQuestionDataSettings {
    min: number | null;
    max: number | null;
}

export class NumberFormQuestionDataType implements FormQuestionDataTypeDefinition<number, NumberFormQuestionDataSettings> {
    validate(value: number, settings: NumberFormQuestionDataSettings): string | null {
        if (settings.min != null && value < settings.min) {
            return `Value is too small (min ${settings.min})`;
        }

        if (settings.max != null && value > settings.max) {
            return `Value is too large (max ${settings.max})`;
        }

        return null;
    }

    getName(): string {
        return "Number";
    }

    getIcon(): IconDefinition {
        return faHashtag;
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
        return [FormQuestionDisplayType.INPUT, FormQuestionDisplayType.RANGE, FormQuestionDisplayType.SELECT];
    }

    importPrimitive(value: any): PrimitiveValue | null {
        return null;
    }

    export(value: PrimitiveValue): any {
        return null;
    }

    getDisplayValue(value: number): PrimitiveValue | null {
        return pString(numberToMaxDecimals(value, 2));
    }

}
