import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {FormQuestionDisplayType} from "@perfice/model/form/form";
import {type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";

export interface RichTextFormQuestionDataSettings {}

export class RichTextFormQuestionDataType implements FormQuestionDataTypeDefinition<string, RichTextFormQuestionDataSettings> {
    getSupportedDisplayTypes(): FormQuestionDisplayType[] {
        return [FormQuestionDisplayType.INPUT, FormQuestionDisplayType.SELECT, FormQuestionDisplayType.RANGE]
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

    validate(value: string, settings: RichTextFormQuestionDataSettings): string | null {
        return null;
    }

    getDefaultSettings(): RichTextFormQuestionDataSettings {
        return {
            minLength: null,
            maxLength: null
        };
    }

    getPrimitiveType(): PrimitiveValueType {
        return PrimitiveValueType.STRING;
    }
}
