import {type TrackableSearch, TrackableSearchDefinition} from "@perfice/model/journal/search/trackable";
import {type TagSearch, TagSearchDefinition} from "@perfice/model/journal/search/tag";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import {type FreeTextSearch, FreeTextSearchDefinition} from "@perfice/model/journal/search/freeText";
import type {Form} from "@perfice/model/form/form";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {Tag} from "@perfice/model/tag/tag";
import {type DateSearch, DateSearchDefinition} from "@perfice/model/journal/search/date";
import type {JournalEntryFilter} from "@perfice/services/variable/filtering";
import {TimeRangeType} from "@perfice/model/variable/time/time";
import {
    faCalendar, faCheck,
    faFont,
    faMinusCircle,
    faPlusCircle,
    faRuler,
    faTags
} from "@fortawesome/free-solid-svg-icons";

export interface JournalSearch {
    id: string;
    name: string;
    entities: SearchEntity[];
}

export interface JournalSearchResult {
    journalEntries: JournalEntry[];
    tagEntries: TagEntry[];
}

export enum SearchEntityType {
    TRACKABLE = "TRACKABLE",
    TAG = "TAG",
    FREE_TEXT = "FREE_TEXT",
    DATE = "DATE",
}

export const SEARCH_ENTITY_TYPES = [
    {
        id: SearchEntityType.TRACKABLE,
        name: "Trackable",
        icon: faRuler
    },
    {
        id: SearchEntityType.TAG,
        name: "Tag",
        icon: faTags
    },
    {
        id: SearchEntityType.FREE_TEXT,
        name: "Free text",
        icon: faFont
    },
    {
        id: SearchEntityType.DATE,
        name: "Date",
        icon: faCalendar
    },
]

export enum SearchEntityMode {
    INCLUDE = "INCLUDE",
    EXCLUDE = "EXCLUDE",

    // If this entity must always match to allow an entry to be included
    // regardless if another definition would match it.
    MUST_MATCH = "MUST_MATCH",
}

export const SEARCH_ENTITY_MODES = [
    {
        value: SearchEntityMode.INCLUDE,
        name: "Include",
        icon: faPlusCircle
    },
    {
        value: SearchEntityMode.EXCLUDE,
        name: "Exclude",
        icon: faMinusCircle
    },
    {
        value: SearchEntityMode.MUST_MATCH,
        name: "Must match",
        icon: faCheck
    },
]

export type SearchEntity = {
    id: string;
    mode: SearchEntityMode;
} & SearchEntities;

export function createDefaultSearchEntity(type: SearchEntityType): SearchEntity {

    let definition = getSearchDefinition(type);

    let data: SearchEntities;
    switch (type) {
        case SearchEntityType.TRACKABLE:
            data = {
                type: SearchEntityType.TRACKABLE,
                value: {
                    filters: []
                }
            }
            break;
        case SearchEntityType.TAG:
            data = {
                type: SearchEntityType.TAG,
                value: {
                    filters: []
                }
            }
            break;
        case SearchEntityType.FREE_TEXT:
            data = {
                type: SearchEntityType.FREE_TEXT,
                value: {
                    search: ""
                }
            }
            break;
        case SearchEntityType.DATE:
            data = {
                type: SearchEntityType.DATE,
                value: {
                    range: {
                        type: TimeRangeType.ALL,
                    }
                }
            };
            break;
    }

    return {
        id: crypto.randomUUID(),
        mode: definition.getDefaultSearchMode(),
        ...data
    }
}

export interface SearchDependencies {
    forms: Form[];

    // TODO: only populate these if found in the search
    tags: Map<string, Tag>; // Tag id -> tag
    trackables: Map<string, Trackable>; // Form id -> trackable id
}

export type SearchEntities = SE<SearchEntityType.TRACKABLE, TrackableSearch>
    | SE<SearchEntityType.TAG, TagSearch>
    | SE<SearchEntityType.FREE_TEXT, FreeTextSearch>
    | SE<SearchEntityType.DATE, DateSearch>;


export interface SearchDefinition<S> {
    matchesJournalEntry(search: S, dependencies: SearchDependencies, entry: JournalEntry): boolean;

    matchesTagEntry(search: S, dependencies: SearchDependencies, entry: TagEntry): boolean;

    getDefaultSearchMode(): SearchEntityMode;
}

export interface SE<T extends SearchEntityType, V> {
    type: T;
    value: V;
}

export interface OneOfFilter {
    values: string[];
}

export interface ByCategoryFilter {
    categories: (string | null)[];
}

export interface ByAnswersFilter {
    filters: JournalEntryFilter[];
}

let searchDefinitions: Record<SearchEntityType, SearchDefinition<any>>;
searchDefinitions = {
    [SearchEntityType.TRACKABLE]: new TrackableSearchDefinition(),
    [SearchEntityType.TAG]: new TagSearchDefinition(),
    [SearchEntityType.FREE_TEXT]: new FreeTextSearchDefinition(),
    [SearchEntityType.DATE]: new DateSearchDefinition()
};

export function getSearchDefinition(type: SearchEntityType): SearchDefinition<any> {
    return searchDefinitions[type];
}

export const DEFAULT_SEARCH_ID = "default";

export function createDefaultSearch(): JournalSearch {
    return {
        id: DEFAULT_SEARCH_ID,
        name: "Search",
        entities: [
            {
                id: crypto.randomUUID(),
                type: SearchEntityType.TRACKABLE,
                mode: SearchEntityMode.INCLUDE,
                value: {
                    filters: []
                }
            },
            {
                id: crypto.randomUUID(),
                type: SearchEntityType.TAG,
                mode: SearchEntityMode.INCLUDE,
                value: {
                    filters: []
                }
            },
            {
                id: crypto.randomUUID(),
                type: SearchEntityType.DATE,
                mode: SearchEntityMode.MUST_MATCH,
                value: {
                    range: {
                        type: TimeRangeType.ALL,
                    }
                }
            },
        ]
    }
}