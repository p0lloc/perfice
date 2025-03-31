import type {TrackableSearch} from "@perfice/model/journal/search/trackable";
import type {TagSearch} from "@perfice/model/journal/search/tag";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import type {FreeTextSearch} from "@perfice/model/journal/search/freeText";
import type {Form} from "@perfice/model/form/form";
import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {Tag, TagCategory} from "@perfice/model/tag/tag";

export interface JournalSearch {

}

export enum SearchEntityType {
    TRACKABLE = "TRACKABLE",
    TAG = "TAG",
    FREE_TEXT = "FREE_TEXT",
    DATE = "DATE",
}

export type SearchEntity = {
    id: string;
} & SearchEntities;

export interface SearchDependencies {
    forms: Form[];

    // TODO: only populate these if found in the search
    tags: Tag[];
    tagCategories: TagCategory[];
    trackables: Trackable[];
    trackableCategories: TrackableCategory[];
}

export type SearchEntities = SE<SearchEntityType.TRACKABLE, TrackableSearch>
    | SE<SearchEntityType.TAG, TagSearch>
    | SE<SearchEntityType.FREE_TEXT, FreeTextSearch>;


export interface SearchDefinition<S> {
    includeJournalEntry(search: S, dependencies: SearchDependencies, entry: JournalEntry): boolean;

    includeTagEntry(search: S, dependencies: SearchDependencies, entry: TagEntry): boolean;
}

export interface SE<T extends SearchEntityType, V> {
    type: T;
    value: V;
}

export interface OneOfFilter {
    values: string[];
}

export interface NotOneOfFilter {
    values: string[];
}

export interface ByCategoryFilter {
    categoryId: string;
}

export interface ByAnswersFilter {

}

