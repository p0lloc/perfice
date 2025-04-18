import type {JournalSearchService} from "@perfice/services/journal/search";
import type {TagCategoryEntityProvider} from "@perfice/services/tag/category";
import type {TagEntityProvider} from "@perfice/services/tag/tag";
import type {TrackableEntityProvider} from "@perfice/services/trackable/trackable";
import type {JournalSearch, SearchEntity} from "@perfice/model/journal/search/search";
import {resolvedPromise} from "@perfice/util/promise";
import {journal, tagEntries} from "@perfice/app";
import type {TrackableCategoryEntityProvider} from "@perfice/services/trackable/category";
import type {JournalSearchUiDependencies} from "@perfice/model/journal/search/ui";
import type {FormEntityProvider} from "@perfice/services/form/form";

export class JournalSearchStore {

    private searchService: JournalSearchService;
    private formEntityProvider: FormEntityProvider;
    private trackableEntityProvider: TrackableEntityProvider;
    private trackableCategoryEntityProvider: TrackableCategoryEntityProvider;
    private tagEntityProvider: TagEntityProvider;
    private tagCategoryEntityProvider: TagCategoryEntityProvider;

    constructor(searchService: JournalSearchService,
                formEntityProvider: FormEntityProvider,
                trackableEntityProvider: TrackableEntityProvider,
                trackableCategoryEntityProvider: TrackableCategoryEntityProvider,
                tagEntityProvider: TagEntityProvider, tagCategoryEntityProvider: TagCategoryEntityProvider) {

        this.formEntityProvider = formEntityProvider;
        this.trackableEntityProvider = trackableEntityProvider;
        this.trackableCategoryEntityProvider = trackableCategoryEntityProvider;
        this.tagEntityProvider = tagEntityProvider;
        this.tagCategoryEntityProvider = tagCategoryEntityProvider;
        this.searchService = searchService;
    }

    async search(search: SearchEntity[]) {
        let result = await this.searchService.searchAll(search);
        journal.set(resolvedPromise(result.journalEntries));
        tagEntries.set(resolvedPromise(result.tagEntries));
    }

    async fetchSavedSearchById(id: string): Promise<JournalSearch | undefined> {
        return this.searchService.getSavedSearchById(id);
    }

    async fetchSavedSearches(): Promise<JournalSearch[]> {
        return this.searchService.getSavedSearches();
    }

    async loadEditDependencies(): Promise<JournalSearchUiDependencies> {
        let forms = await this.formEntityProvider.getForms();
        let trackables = await this.trackableEntityProvider.getTrackables();
        let trackableCategories = await this.trackableCategoryEntityProvider.getCategories();
        let tags = await this.tagEntityProvider.getTags();
        let tagCategories = await this.tagCategoryEntityProvider.getCategories();

        return {
            forms,
            trackables,
            tags,
            trackableCategories,
            tagCategories
        }
    }

    async createSavedSearch(search: JournalSearch) {
        await this.searchService.putSavedSearch(search);
    }

    async updateSavedSearch(search: JournalSearch) {
        await this.searchService.putSavedSearch(search);
    }

}
