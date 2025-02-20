import {derived, type Readable} from "svelte/store";
import {categorize, type CategoryList} from "@perfice/util/category";
import type {Tag, TagCategory} from "@perfice/model/tag/tag";
import {tagCategories, tags} from "@perfice/main";

export function CategorizedTags(): Readable<Promise<CategoryList<TagCategory, Tag>[]>> {
    return derived<[Readable<Promise<Tag[]>>, Readable<Promise<TagCategory[]>>],
        Promise<CategoryList<TagCategory, Tag>[]>>

    ([tags, tagCategories], ([$tags, $categories], set) => {
        let promise = new Promise<CategoryList<TagCategory, Tag>[]>(
            async (resolve) => {
                let tags = await $tags;
                let categories = await $categories;

                let res = categorize(categories, tags);
                resolve(res);
            });
        set(promise);
    });
}
