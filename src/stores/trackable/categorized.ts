import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {CategoryList} from "@perfice/util/category";
import {derived, writable, type Readable, type Writable} from "svelte/store";
import {trackableCategories, trackables} from "@perfice/main";

let order: Writable<Record<string, string[]>> = writable({});

export function CategorizedTrackables(): Readable<Promise<CategoryList<TrackableCategory, Trackable>[]>> {
    return derived<[Readable<Promise<Trackable[]>>, Readable<Promise<TrackableCategory[]>>],
        Promise<CategoryList<TrackableCategory, Trackable>[]>>

    ([trackables, trackableCategories], ([$trackables, $categories], set) => {
        let promise = new Promise<CategoryList<TrackableCategory, Trackable>[]>(async (resolve) => {
            let trackables = await $trackables;
            let categories = await $categories;

            let uncategorized: CategoryList<TrackableCategory, Trackable> =
                {
                    category: null,
                    items: []
                };

            let res: CategoryList<TrackableCategory, Trackable>[] = [
                // Category for uncategorized trackables
                uncategorized,
            ];

            for (let category of categories) {
                // Add a category list for each category
                res.push({category, items: []});
            }

            for (let trackable of trackables) {
                // Group each trackable by category
                let category = res.find(c => c.category?.id == trackable.categoryId
                    || (trackable.categoryId == null && c.category == null));
                if (category == null) continue;

                category.items.push(trackable);
            }

            for (let category of res) {
                category.items = category.items.sort((a, b) => a.order - b.order);
            }

            resolve(res);
        });
        set(promise);
    });
}
