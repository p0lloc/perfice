import {
    type ByAnswersFilter,
    type ByCategoryFilter,
    type OneOfFilter, type SearchDefinition, type SearchDependencies, SearchEntityMode,
} from "@perfice/model/journal/search/search";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import {shouldFilterOutEntry} from "@perfice/services/variable/filtering";
import {faCheck, faFilter, faFolder} from "@fortawesome/free-solid-svg-icons";

export enum TrackableSearchFilterType {
    ONE_OF = "ONE_OF",
    BY_CATEGORY = "BY_CATEGORY",
    BY_ANSWERS = "BY_ANSWERS",
}

export class TrackableSearchDefinition implements SearchDefinition<TrackableSearch> {
    matchesJournalEntry(search: TrackableSearch, dependencies: SearchDependencies, entry: JournalEntry): boolean {
        for (let filter of search.filters) {
            switch (filter.type) {
                case TrackableSearchFilterType.ONE_OF: {
                    let trackable = dependencies.trackables.get(entry.formId);
                    if (trackable == null) return false;
                    if (!filter.value.values.includes(trackable.id)) return false;

                    break;
                }
                case TrackableSearchFilterType.BY_CATEGORY: {
                    let trackable = dependencies.trackables.get(entry.formId);
                    if (trackable == null) return false;
                    if (!filter.value.categories.includes(trackable.categoryId)) return false;

                    break;
                }
                case TrackableSearchFilterType.BY_ANSWERS: {
                    if (shouldFilterOutEntry(entry, filter.value.filters, false)) {
                        return false;
                    }

                    break;
                }
            }
        }

        return true;
    }

    matchesTagEntry(search: TrackableSearch, dependencies: SearchDependencies, entry: TagEntry): boolean {
        return false;
    }
    getDefaultSearchMode(): SearchEntityMode {
        return SearchEntityMode.INCLUDE;
    }
}

export type TrackableSearchFilters = TSF<TrackableSearchFilterType.ONE_OF, OneOfFilter>
    | TSF<TrackableSearchFilterType.BY_CATEGORY, ByCategoryFilter>
    | TSF<TrackableSearchFilterType.BY_ANSWERS, ByAnswersFilter>;

export type TrackableSearchFilter = {
    id: string;
} & TrackableSearchFilters;

export const TRACKABLE_SEARCH_FILTER_TYPES = [
    {
        value: TrackableSearchFilterType.ONE_OF,
        name: "One of",
        icon: faFilter
    },
    {
        value: TrackableSearchFilterType.BY_CATEGORY,
        name: "By category",
        icon: faFolder
    },
    {
        value: TrackableSearchFilterType.BY_ANSWERS,
        name: "By answers",
        icon: faCheck
    }
];

export function createTrackableSearchFilter(type: TrackableSearchFilterType): TrackableSearchFilter {
    let filter: TrackableSearchFilters;

    switch (type) {
        case TrackableSearchFilterType.ONE_OF:
            filter = {
                type: TrackableSearchFilterType.ONE_OF,
                value: {
                    values: []
                }
            };
            break;
        case TrackableSearchFilterType.BY_CATEGORY:
            filter = {
                type: TrackableSearchFilterType.BY_CATEGORY,
                value: {
                    categories: []
                }
            };
            break;
        case TrackableSearchFilterType.BY_ANSWERS:
            filter = {
                type: TrackableSearchFilterType.BY_ANSWERS,
                value: {
                    filters: []
                }
            };
            break;
    }

    return {
        id: crypto.randomUUID(),
        ...filter
    };
}

export interface TSF<T extends TrackableSearchFilterType, V> {
    type: T;
    value: V;
}

export interface TrackableSearch {
    filters: TrackableSearchFilter[];
}