import type {FormDisplayTypeDefinition} from "@perfice/model/form/display";
import {type PrimitiveValue, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
import {faRulerHorizontal, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
import type {NumberFormQuestionDataSettings} from "@perfice/model/form/data/number";

export interface RangeLabel {
    id: string;
    text: string;
}

export interface RangeFormQuestionSettings {
    step: number;
    labels: RangeLabel[] | null;
}

export const DEFAULT_RANGE_MIN_VALUE = 0;
export const DEFAULT_RANGE_MAX_VALUE = 100;
export const DEFAULT_RANGE_STEP = 1;

export class RangeFieldDefinition implements FormDisplayTypeDefinition<RangeFormQuestionSettings> {
    validate(value: PrimitiveValue): string | null {
        return null;
    }

    hasMultiple(s: RangeFormQuestionSettings): boolean {
        return false;
    }

    getDefaultSettings(): RangeFormQuestionSettings {
        return {
            step: 1,
            labels: null
        };
    }

    getDisplayValue(value: PrimitiveValue, displaySettings: RangeFormQuestionSettings, dataSettings: NumberFormQuestionDataSettings): PrimitiveValue | null {
        if (value.type != PrimitiveValueType.NUMBER) return null;

        let step = displaySettings.step ?? DEFAULT_RANGE_STEP;
        let min = dataSettings.min ?? DEFAULT_RANGE_MIN_VALUE;
        let index = Math.floor((value.value - min) / step);

        let labels = displaySettings.labels;
        if (labels == null || index >= labels.length) return null;

        return pString(labels[index].text);
    }

    onDataTypeChanged(s: RangeFormQuestionSettings, dataType: string): RangeFormQuestionSettings {
        return s;
    }


    getName(): string {
        return "Range";
    }

    getIcon(): IconDefinition {
        return faRulerHorizontal;
    }

}
