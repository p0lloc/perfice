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

export function convertResultKey(key: string, forms: Form[], tags: Tag[]) {
    let parts = key.split("|");
    let first = parts[0];
    let second = parts[1];

    if (first.startsWith("lag_")) {
        return convertSingleKey(second, forms, tags) + " after days with " + convertSingleKey(first.substring(4), forms, tags);
    }

    return `${convertSingleKey(first, forms, tags)} | ${convertSingleKey(second, forms, tags)}`;
}
