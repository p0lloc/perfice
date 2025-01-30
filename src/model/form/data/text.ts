import type {FormQuestionDataTypeDefinition} from "../data";
import {FormQuestionDisplayType} from "@perfice/model/form/form";
import {type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";

export interface TextFormQuestionDataSettings {
    minLength: number | null;
    maxLength: number | null;
}

export class TextFormQuestionDataType implements FormQuestionDataTypeDefinition<string, TextFormQuestionDataSettings> {
    getSupportedDisplayTypes(): FormQuestionDisplayType[] {
        return [FormQuestionDisplayType.INPUT, FormQuestionDisplayType.SELECT, FormQuestionDisplayType.SEGMENTED]
    }

    serialize(value: PrimitiveValue): string {
        return value.value?.toString() ?? "";
    }

    getDefaultValue(): string {
        return "";
    }

    deserialize(value: string): PrimitiveValue {
        return pString(value);
    }

    validate(value: string, settings: TextFormQuestionDataSettings): string | null {
        if(settings.maxLength != null && value.length > settings.maxLength){
            return `Text is too long! (max ${settings.maxLength})`;
        }

        if(settings.minLength != null && value.length > settings.minLength){
            return `Text is too short (min ${settings.minLength})!`;
        }

        return null;
    }

    getDefaultSettings(): TextFormQuestionDataSettings {
        return {
            minLength: null,
            maxLength: null
        };
    }

    getPrimitiveType(): PrimitiveValueType {
        return PrimitiveValueType.STRING;
    }
}
