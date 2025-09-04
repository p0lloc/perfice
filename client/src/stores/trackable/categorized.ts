import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import {categorize, type CategoryList} from "@perfice/util/category";
import {derived, type Readable} from "svelte/store";
import {trackableCategories, trackables} from "@perfice/stores";

export function CategorizedTrackables(): Readable<Promise<CategoryList<TrackableCategory, Trackable>[]>> {
    return derived<[Readable<Promise<Trackable[]>>, Readable<Promise<TrackableCategory[]>>],
        Promise<CategoryList<TrackableCategory, Trackable>[]>>

    ([trackables, trackableCategories], ([$trackables, $categories], set) => {
        let promise = new Promise<CategoryList<TrackableCategory, Trackable>[]>(
            async (resolve) => {
                let trackables = await $trackables;
                let categories = (await $categories)
                    .sort((a, b) => a.order - b.order);

                let res = categorize(categories, trackables);

                for (let category of res) {
                    category.items = category.items.sort((a, b) =>
                        a.order - b.order);
                }

                resolve(res);
            });
        set(promise);
    });
}
