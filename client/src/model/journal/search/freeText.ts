import {type SearchDefinition, type SearchDependencies, SearchEntityMode} from "@perfice/model/journal/search/search";
import type {JournalEntry, TagEntry} from "../journal";
import {primitiveAsString} from "@perfice/model/primitive/primitive";

export interface FreeTextSearch {
    search: string;
}

export class FreeTextSearchDefinition implements SearchDefinition<FreeTextSearch> {
    matchesJournalEntry(search: FreeTextSearch, _dependencies: SearchDependencies, entry: JournalEntry): boolean {
        if (entry.displayValue.toLowerCase().includes(search.search))
            return true;

        // Returns true when any of the answers contains the search string
        return Object.values(entry.answers)
            .some(v => primitiveAsString(v).toLowerCase().includes(search.search));
    }

    matchesTagEntry(search: FreeTextSearch, dependencies: SearchDependencies, entry: TagEntry): boolean {
        let tag = dependencies.tags.get(entry.tagId);
        if (tag == null) return false;

        return tag.name.toLowerCase().includes(search.search);
    }

    getDefaultSearchMode(): SearchEntityMode {
        return SearchEntityMode.MUST_MATCH;
    }
}