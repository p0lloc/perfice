import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {CategoryList} from "@perfice/util/category";
import {derived, writable, type Readable, type Writable} from "svelte/store";
import {trackableCategories, trackables} from "@perfice/main";

let order: Writable<Record<string, string[]>> = writable({});

export function onReorderTrackables(category: TrackableCategory | null, items: Trackable[]) {
    order.update(o => {
        return {...o, [category?.id ?? ""]: items.map(t => t.id)};
    });
}

export function CategorizedTrackables(): Readable<Promise<CategoryList<TrackableCategory, Trackable>[]>> {
    return derived<[Readable<Promise<Trackable[]>>, Readable<Promise<TrackableCategory[]>>, Writable<Record<string, string[]>>],
        Promise<CategoryList<TrackableCategory, Trackable>[]>>

    ([trackables, trackableCategories, order], ([$trackables, $categories, order], set) => {
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
                if(category == null) continue;
                category.items.push(trackable);
            }

            for(let [categoryId, trackableIds] of Object.entries(order)){
                let category = res.find(c =>
                    c.category?.id == categoryId || (categoryId == "" && c.category == null));
                if(category == null) continue;

                console.log(category);

                category.items = trackableIds.map(id => trackables.find(t => t.id == id)).filter(t => t != null);
            }

            resolve(res);
        });
        set(promise);
    });
}
