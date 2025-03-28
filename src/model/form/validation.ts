import {pDisplay, pList, type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import type {FormQuestion} from "@perfice/model/form/form";
import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";

function deserializeMultiple(dataTypeDef: FormQuestionDataTypeDefinition<any, any>, multiple: any[]): PrimitiveValue | null {
    let result: PrimitiveValue[] = [];
    for (let v of multiple) {
        let deserialized = dataTypeDef.deserialize(v);
        if (deserialized == null) {
            return null;
        }

        result.push(deserialized);
    }

    return pList(result);
}

function validateMultiple(dataTypeDef: FormQuestionDataTypeDefinition<any, any>, question: FormQuestion, value: PrimitiveValue): string | null {
    if (value.type == PrimitiveValueType.LIST) {
        for (let v of value.value) {
            let error = dataTypeDef.validate(v.value, question.dataSettings);
            if (error != null) return error;
        }
    }

    return null;
}

export function parseAndValidateValue(valueSnapshot: any, question: FormQuestion, dataTypeDef: FormQuestionDataTypeDefinition<any, any>,
                                      displayTypeDef: FormDisplayTypeDefinition<any>): [PrimitiveValue | null, string | null] {
    let value: PrimitiveValue | null;
    if (displayTypeDef.hasMultiple(question.displaySettings) && Array.isArray(valueSnapshot)) {
        value = deserializeMultiple(dataTypeDef, valueSnapshot);
    } else {
        value = dataTypeDef.deserialize(valueSnapshot);
    }

    if (value == null) {
        return [null, "Input is incorrectly formatted!"];
    }

    let dataError;
    if (displayTypeDef.hasMultiple(question.displaySettings)) {
        dataError = validateMultiple(dataTypeDef, question, value);
    } else {
        dataError = dataTypeDef.validate(value.value, question.dataSettings);
    }

    if (dataError != null) {
        return [null, dataError];
    }

    let displayError = displayTypeDef.validate(value);
    if (displayError != null) {
        return [null, displayError];
    }

    return [convertValueToDisplay(value, question, dataTypeDef, displayTypeDef), null];
}

export function convertValueToDisplay(value: PrimitiveValue, question: FormQuestion, dataTypeDef: FormQuestionDataTypeDefinition<any, any>,
                                      displayTypeDef: FormDisplayTypeDefinition<any>): PrimitiveValue {
    let displayValue = displayTypeDef.getDisplayValue(value, question.displaySettings, question.dataSettings);
    if (displayValue == null) {
        displayValue = dataTypeDef.getDisplayValue(dataTypeDef.serialize(value)) ?? pString("");
    }

    if (displayValue.type == PrimitiveValueType.STRING && question.unit != null) {
        // Append unit to the display value
        displayValue.value += ` ${question.unit}`;
    }

    return pDisplay(value, displayValue);
}
