import type {
    ByCategoryFilter,
    OneOfFilter,
    SearchDefinition,
    SearchDependencies
} from "@perfice/model/journal/search/search";
import type {JournalEntry, TagEntry} from "../journal";

export enum TagSearchFilterType {
    ONE_OF = "ONE_OF",
    BY_CATEGORY = "BY_CATEGORY",
}

export type TagSearchFilters = TSF<TagSearchFilterType.ONE_OF, OneOfFilter>
    | TSF<TagSearchFilterType.BY_CATEGORY,
    ByCategoryFilter>;

export type TagSearchFilter = {
    id: string;
} & TagSearchFilters;

export interface TSF<T extends TagSearchFilterType, V> {
    type: T;
    value: V;
}

export interface TagSearch {
    filters: TagSearchFilter[];
}

export class TagSearchDefinition implements SearchDefinition<TagSearch> {
    matchesJournalEntry(search: TagSearch, dependencies: SearchDependencies, entry: JournalEntry): boolean {
        return false;
    }

    matchesTagEntry(search: TagSearch, dependencies: SearchDependencies, entry: TagEntry): boolean {
        for (let filter of search.filters) {
            switch (filter.type) {
                case TagSearchFilterType.ONE_OF: {
                    if (!filter.value.values.includes(entry.tagId)) return false;

                    break;
                }
                case TagSearchFilterType.BY_CATEGORY: {
                    let tag = dependencies.tags.get(entry.tagId);
                    if (tag == null) return false;
                    if (!filter.value.categories.includes(tag.categoryId)) return false;

                    break;
                }
            }
        }

        return true;
    }
}
