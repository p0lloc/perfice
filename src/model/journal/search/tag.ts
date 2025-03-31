import type {
    ByAnswersFilter,
    ByCategoryFilter,
    NotOneOfFilter,
    OneOfFilter
} from "@perfice/model/journal/search/search";

export enum TagSearchFilterType {
    ONE_OF = "ONE_OF",
    NOT_ONE_OF = "NOT_ONE_OF",
    BY_CATEGORY = "BY_CATEGORY",
}

export type TagSearchFilters = TSF<TagSearchFilterType.ONE_OF, OneOfFilter>
    | TSF<TagSearchFilterType.NOT_ONE_OF, NotOneOfFilter>
    | TSF<TagSearchFilterType.BY_CATEGORY, ByCategoryFilter>;

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