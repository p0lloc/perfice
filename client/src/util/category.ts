import type {Identified} from "@perfice/util/array";

export const UNCATEGORIZED_NAME = "Uncategorized";

export interface CategoryList<C, T> {
    category: C | null;
    items: T[];
}

export interface CategoryItem {
    categoryId: string | null;
}

export function categorize<C extends Identified<string>, T extends CategoryItem>(categories: C[], items: T[]): CategoryList<C, T>[] {
    let uncategorized: CategoryList<C, T> =
        {
            category: null,
            items: []
        };

    let res: CategoryList<C, T>[] = [
        // Category for uncategorized items
        uncategorized,
    ];

    for (let category of categories) {
        // Add a category list for each category
        res.push({category, items: []});
    }

    for (let item of items) {
        // Group each item by category
        let category = res.find(c => c.category?.id == item.categoryId
            || (item.categoryId == null && c.category == null));

        if (category == null) continue;

        category.items.push(item);
    }

    return res;
}
