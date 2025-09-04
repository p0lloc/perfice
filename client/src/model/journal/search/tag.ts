import {
    type ByCategoryFilter,
    type OneOfFilter,
    type SearchDefinition,
    type SearchDependencies, SearchEntityMode
} from "@perfice/model/journal/search/search";
import type {JournalEntry, TagEntry} from "../journal";
import {faFilter, faFolder} from "@fortawesome/free-solid-svg-icons";

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


export const TAG_SEARCH_FILTER_TYPES = [
    {
        value: TagSearchFilterType.ONE_OF,
        name: "One of",
        icon: faFilter
    },
    {
        value: TagSearchFilterType.BY_CATEGORY,
        name: "By category",
        icon: faFolder
    },
];

export function createTagSearchFilter(type: TagSearchFilterType): TagSearchFilter {
    let filter: TagSearchFilters;

    switch (type) {
        case TagSearchFilterType.ONE_OF:
            filter = {
                type: TagSearchFilterType.ONE_OF,
                value: {
                    values: []
                }
            };
            break;
        case TagSearchFilterType.BY_CATEGORY:
            filter = {
                type: TagSearchFilterType.BY_CATEGORY,
                value: {
                    categories: []
                }
            };
            break;
    }

    return {
        id: crypto.randomUUID(),
        ...filter
    };
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

    getDefaultSearchMode(): SearchEntityMode {
        return SearchEntityMode.INCLUDE;
    }
}
