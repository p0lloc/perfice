import type {JournalCollection, SavedSearchCollection, TagEntryCollection} from "@perfice/db/collections";
import type {TrackableEntityProvider} from "@perfice/services/trackable/trackable";
import type {TagEntityProvider} from "@perfice/services/tag/tag";
import {
    getSearchDefinition, type JournalSearch,
    type JournalSearchResult,
    type SearchDefinition,
    type SearchDependencies,
    type SearchEntity,
    SearchEntityMode,
    SearchEntityType
} from "@perfice/model/journal/search/search";
import type {Tag} from "@perfice/model/tag/tag";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {FormEntityProvider} from "@perfice/services/form/form";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";

export class JournalSearchService {

    private journalCollection: JournalCollection;
    private tagEntryCollection: TagEntryCollection;
    private trackableEntityProvider: TrackableEntityProvider;
    private tagEntityProvider: TagEntityProvider;
    private formEntityProvider: FormEntityProvider;

    private savedSearchCollection: SavedSearchCollection;

    constructor(journalCollection: JournalCollection,
                tagEntryCollection: TagEntryCollection,
                trackableEntityProvider: TrackableEntityProvider,
                tagEntityProvider: TagEntityProvider,
                formEntityProvider: FormEntityProvider,
                savedSearchCollection: SavedSearchCollection) {
        this.journalCollection = journalCollection;
        this.tagEntryCollection = tagEntryCollection;
        this.trackableEntityProvider = trackableEntityProvider;
        this.tagEntityProvider = tagEntityProvider;
        this.formEntityProvider = formEntityProvider;
        this.savedSearchCollection = savedSearchCollection;
    }

    public async getSavedSearches(): Promise<JournalSearch[]> {
        return this.savedSearchCollection.getSavedSearches();
    }

    getSavedSearchById(id: string): Promise<JournalSearch | undefined> {
        return this.savedSearchCollection.getSavedSearchById(id);
    }

    public async putSavedSearch(search: JournalSearch): Promise<void> {
        await this.savedSearchCollection.putSavedSearch(search);
    }

    private async getNecessaryDependencies(search: SearchEntity[]): Promise<SearchDependencies> {
        let includeTrackables = false;
        let includeTags = false;
        for (let entity of search) {
            switch (entity.type) {
                case SearchEntityType.TRACKABLE:
                    includeTrackables = true;
                    break;
                case SearchEntityType.TAG:
                    includeTags = true;
                    break;
                case SearchEntityType.FREE_TEXT:
                    // Need to include tags since we search by name
                    includeTags = true;
                    break;
            }
        }

        let trackables: Map<string, Trackable> = new Map();
        if (includeTrackables) {
            let allTrackables = await this.trackableEntityProvider.getTrackables();
            for (let trackable of allTrackables) {
                trackables.set(trackable.formId, trackable);
            }
        }

        let tags: Map<string, Tag> = new Map();
        if (includeTags) {
            let allTags = await this.tagEntityProvider.getTags();
            for (let tag of allTags) {
                tags.set(tag.id, tag);
            }
        }

        return {
            forms: await this.formEntityProvider.getForms(),
            trackables,
            tags,
        };
    }

    private runFilter<T>(entities: [SearchEntity, SearchDefinition<any>][], entries: T[], resultList: T[],
                         matcher: (def: SearchDefinition<any>, search: any, entry: T) => boolean, include: boolean) {

        for (let entry of entries) {
            let matches = false;
            for (let [entity, definition] of entities) {
                let mustBeMatched = include && entity.mode == SearchEntityMode.MUST_MATCH;

                if (matcher(definition, entity.value, entry)) {
                    if (!mustBeMatched) {
                        matches = true;
                    }
                } else {
                    if (mustBeMatched) {
                        matches = false;
                        break;
                    }
                }
            }

            if ((include && matches) || (!include && !matches)) {
                resultList.push(entry);
            }
        }
    }

    async searchAll(search: SearchEntity[]): Promise<JournalSearchResult> {
        let dependencies = await this.getNecessaryDependencies(search);
        let allJournalEntries = await this.journalCollection.getAllEntries();
        let allTagEntries = await this.tagEntryCollection.getAllEntries();

        let includedJournalEntries: JournalEntry[] = [];
        let includedTagEntries: TagEntry[] = [];

        let includeSearchEntities: [SearchEntity, SearchDefinition<any>][] = [];
        let excludeSearchEntities: [SearchEntity, SearchDefinition<any>][] = [];
        for (let entity of search) {
            let definition = getSearchDefinition(entity.type);
            if (entity.mode != SearchEntityMode.EXCLUDE) {
                includeSearchEntities.push([entity, definition]);
            } else {
                excludeSearchEntities.push([entity, definition]);
            }
        }

        // Include all entries that match the search criteria

        this.runFilter(includeSearchEntities, allJournalEntries, includedJournalEntries,
            (def, search, entry) => def.matchesJournalEntry(search, dependencies, entry), true);

        this.runFilter(includeSearchEntities, allTagEntries, includedTagEntries,
            (def, search, entry) => def.matchesTagEntry(search, dependencies, entry), true);

        let finalJournalEntries: JournalEntry[] = [];
        let finalTagEntries: TagEntry[] = [];

        // Exclude all included entries that match the exclusion search criteria

        this.runFilter(excludeSearchEntities, includedJournalEntries, finalJournalEntries,
            (def, search, entry) => def.matchesJournalEntry(search, dependencies, entry), false);

        this.runFilter(excludeSearchEntities, includedTagEntries, finalTagEntries,
            (def, search, entry) => def.matchesTagEntry(search, dependencies, entry), false);

        return {
            journalEntries: finalJournalEntries,
            tagEntries: finalTagEntries
        };
    }

}