import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pNumber, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "../form";
import {formatTimeElapsed} from "@perfice/util/time/format";
import {faStopwatch, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {parseHhMmElapsedMinutes} from "@perfice/util/time/simple";

export interface TimeElapsedFormQuestionDataSettings {
}


export class TimeElapsedFormQuestionDataType implements FormQuestionDataTypeDefinition<number, TimeElapsedFormQuestionDataSettings> {
    validate(value: number, settings: TimeElapsedFormQuestionDataSettings): string | null {
        if (value < 0) {
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

    getName(): string {
        return "Time elapsed";
    }

    getIcon(): IconDefinition {
        return faStopwatch;
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
        if (typeof value == "string") {
            let timeElapsed = parseHhMmElapsedMinutes(value);
            if (timeElapsed != null) {
                return pNumber(timeElapsed);
            }
        }

        let number = parseFloat(value);
        if (isNaN(number)) {
            return null;
        }

        return pNumber(number);
    }

    getSupportedDisplayTypes(): FormQuestionDisplayType[] {
        return [FormQuestionDisplayType.INPUT];
    }


    importPrimitive(value: any): PrimitiveValue | null {
        return null;
    }

    export(value: PrimitiveValue): any {
        return null;
    }

    getDisplayValue(value: number): PrimitiveValue | null {
        return pString(formatTimeElapsed(value));
    }

}
