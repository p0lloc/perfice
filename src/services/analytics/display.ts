import type {Form} from "@perfice/model/form/form";
import type {Tag} from "@perfice/model/tag/tag";

export function convertSingleKey(key: string, forms: Form[], tags: Tag[]): string {
    if (key.startsWith("cat_")) {
        key = key.substring(4);
    }

    if (key.startsWith("wd_")) {
        return key.substring(3);
    }
    if (key.startsWith("lag_")) {
        return "lagged " + convertSingleKey(key.substring(4), forms, tags);
    }

    if (key.startsWith("tag_")) {
        let tag = tags.find(t => t.id == key.substring(4));
        if (tag == null) return "Unknown tag";

        return tag.name;
    }

    let parts = key.split(":");
    let form = forms.find(f => f.id == parts[0]);
    if (form == null) return "Unknown form";

    let question = form.questions.find(q => q.id == parts[1]);
    if (question == null) return "Unknown question";

    let base = `${form.name} > ${question.name}`;

    if (parts.length > 2) {
        base += ` (${parts[2]})`;
    }

    return base;
}

export interface CorrelationDisplay {
    first: string;
    second: string;
    result: string;
}

const ELLIPSIS = "...";

export function ellipsis(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength - ELLIPSIS.length) + ELLIPSIS;
}

export function convertResultKey(key: string, forms: Form[], tags: Tag[]): CorrelationDisplay {
    let parts = key.split("|");
    let first = parts[0];
    let second = parts[1];

    if (first.startsWith("lag_")) {
        let secondConverted = convertSingleKey(second, forms, tags);
        let firstConverted = convertSingleKey(first.substring(4), forms, tags);
        let result = secondConverted + " after days with " + firstConverted;

        return {
            first: firstConverted,
            second: secondConverted,
            result: result
        }
    }

    let firstConverted = convertSingleKey(first, forms, tags);
    let secondConverted = convertSingleKey(second, forms, tags);
    let result = `${firstConverted} | ${secondConverted}`;

    return {
        first: firstConverted,
        second: secondConverted,
        result: result
    }
}
