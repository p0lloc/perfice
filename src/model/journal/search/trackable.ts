import {
    type ByAnswersFilter,
    type ByCategoryFilter,
    type NotOneOfFilter,
    type OneOfFilter, type SearchDefinition, type SearchDependencies,
} from "@perfice/model/journal/search/search";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";

export enum TrackableSearchFilterType {
    ONE_OF = "ONE_OF",
    NOT_ONE_OF = "NOT_ONE_OF",
    BY_CATEGORY = "BY_CATEGORY",
    BY_ANSWERS = "BY_ANSWERS",
}

export class TrackableSearchDefinition implements SearchDefinition<TrackableSearch> {
    includeJournalEntry(search: TrackableSearch, dependencies: SearchDependencies, entry: JournalEntry): boolean {

        for (let filter of search.filters) {
            switch (filter.type) {
                case TrackableSearchFilterType.ONE_OF: {
                    if (!filter.value.values.includes(entry.formId)) return false;

                    break;
                }
                case TrackableSearchFilterType.NOT_ONE_OF: {
                    if (filter.value.values.includes(entry.formId)) return false;

                    break;
                }
            }
        }

        return true;
    }

    includeTagEntry(search: TrackableSearch, dependencies: SearchDependencies, entry: TagEntry): boolean {
        return true;
    }
}

export type TrackableSearchFilters = TSF<TrackableSearchFilterType.ONE_OF, OneOfFilter>
    | TSF<TrackableSearchFilterType.NOT_ONE_OF, NotOneOfFilter>
    | TSF<TrackableSearchFilterType.BY_CATEGORY, ByCategoryFilter>
    | TSF<TrackableSearchFilterType.BY_ANSWERS, ByAnswersFilter>;

export type TrackableSearchFilter = {
    id: string;
} & TrackableSearchFilters;

export interface TSF<T extends TrackableSearchFilterType, V> {
    type: T;
    value: V;
}

export interface TrackableSearch {
    filters: TrackableSearchFilter[];
}