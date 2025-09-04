import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pNull, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "../form";
import {formatDateYYYYMMDDHHMMSS} from "@perfice/util/time/format";
import {faCalendar} from "@fortawesome/free-solid-svg-icons";

export interface DateTimeFormQuestionDataSettings {
}


export class DateTimeFormQuestionDataType implements FormQuestionDataTypeDefinition<string, DateTimeFormQuestionDataSettings> {
    validate(value: string, settings: DateTimeFormQuestionDataSettings): string | null {
        return null;
    }

    getDefaultSettings(): DateTimeFormQuestionDataSettings {
        return {};
    }

    getDefaultValue(): string {
        // TODO: do we want to pass in date to getDefaultValue so we can show past dates if user is logging for one of them?
        return formatDateYYYYMMDDHHMMSS(new Date());
    }

    getName(): string {
        return "Date & time";
    }

    getIcon(): any {
        return faCalendar;
    }

    getPrimitiveType(): PrimitiveValueType {
        return PrimitiveValueType.STRING;
    }

    serialize(value: PrimitiveValue) {
        if (value.type == PrimitiveValueType.STRING) {
            return value.value;
        }

        return formatDateYYYYMMDDHHMMSS(new Date(0));
    }

    deserialize(value: any): PrimitiveValue | null {
        let date = new Date(value);
        if (isNaN(date.valueOf())) {
            return pNull();
        }

        return pString(formatDateYYYYMMDDHHMMSS(date));
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

    getDisplayValue(value: string): PrimitiveValue | null {
        return pString(value.toString());
    }

}
