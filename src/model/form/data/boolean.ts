import type {FormQuestionDataSettings, FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import {pBoolean, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {FormQuestionDisplayType} from "../form";
import {faCheck, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface BooleanFormQuestionDataSettings {
}

export class BooleanFormQuestionDataType implements FormQuestionDataTypeDefinition<boolean, BooleanFormQuestionDataSettings> {
    validate(value: boolean, settings: BooleanFormQuestionDataSettings): string | null {
        return null;
    }

    getDefaultSettings(): BooleanFormQuestionDataSettings {
        return {};
    }

    getDefaultValue(): boolean {
        return false;
    }

    getPrimitiveType(): PrimitiveValueType {
        return PrimitiveValueType.BOOLEAN;
    }

    getName(): string {
        return "True/false";
    }

    getIcon(): IconDefinition {
        return faCheck;
    }

    serialize(value: PrimitiveValue) {
        if (value.type == PrimitiveValueType.BOOLEAN) {
            return value.value;
        }

        return false;
    }

    deserialize(value: boolean): PrimitiveValue | null {
        return pBoolean(value);
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

    getDisplayValue(value: boolean): PrimitiveValue | null {
        return pString(value.toString());
    }

}
