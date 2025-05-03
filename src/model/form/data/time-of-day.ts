import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pNumber, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "@perfice/model/form/form";
import {formatTimestampHHMM} from "@perfice/util/time/format";
import {faCalendar, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {parseHhMmTimeOfDayMinutes} from "@perfice/util/time/simple";

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

    getName(): string {
        return "Time of day";
    }

    getIcon(): IconDefinition {
        return faCalendar;
    }

    serialize(value: PrimitiveValue) {
        if (value.type == PrimitiveValueType.NUMBER) {
            return value.value;
        }

        return 0.0;
    }

    deserialize(value: any): PrimitiveValue | null {
        if (typeof value == "string") {
            let timeOfDay = parseHhMmTimeOfDayMinutes(value);
            if (timeOfDay != null) {
                return pNumber(timeOfDay);
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
        return pString(formatTimestampHHMM(value));
    }

}
