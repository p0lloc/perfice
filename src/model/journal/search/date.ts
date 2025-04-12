import {type SearchDefinition, type SearchDependencies, SearchEntityMode} from "@perfice/model/journal/search/search";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import {isTimestampInRange, type TimeRange} from "@perfice/model/variable/time/time";

export interface DateSearch {
    range: TimeRange;
}

export class DateSearchDefinition implements SearchDefinition<DateSearch> {
    matchesJournalEntry(search: DateSearch, _dependencies: SearchDependencies, entry: JournalEntry): boolean {
        return isTimestampInRange(entry.timestamp, search.range);
    }

    matchesTagEntry(search: DateSearch, _dependencies: SearchDependencies, entry: TagEntry): boolean {
        return isTimestampInRange(entry.timestamp, search.range);
    }

    getDefaultSearchMode(): SearchEntityMode {
        return SearchEntityMode.MUST_MATCH;
    }
}
