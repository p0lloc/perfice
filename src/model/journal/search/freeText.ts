import type {SearchDefinition, SearchDependencies} from "@perfice/model/journal/search/search";
import type {JournalEntry, TagEntry} from "../journal";

export interface FreeTextSearch {
    search: string;
}

export class FreeTextSearchDefinition implements SearchDefinition<FreeTextSearch> {
    includeJournalEntry(search: FreeTextSearch, dependencies: SearchDependencies, entry: JournalEntry): boolean {
        return true;
    }

    includeTagEntry(search: FreeTextSearch, dependencies: SearchDependencies, entry: TagEntry): boolean {
        let tag = dependencies.tags.find(t => t.id == entry.tagId);
        if (tag == null) return false;

        return tag.name.toLowerCase().includes(search.search);
    }
}