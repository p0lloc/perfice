import type {JournalSearchService} from "@perfice/services/journal/search";
import type {TagCategoryEntityProvider} from "@perfice/services/tag/category";
import type {TagEntityProvider} from "@perfice/services/tag/tag";
import type {TrackableEntityProvider} from "@perfice/services/trackable/trackable";
import {
    type JournalSearch,
    type SearchEntity,
    SearchEntityMode,
    SearchEntityType
} from "@perfice/model/journal/search/search";
import {resolvedPromise} from "@perfice/util/promise";
import type {TrackableCategoryEntityProvider} from "@perfice/services/trackable/category";
import type {JournalSearchUiDependencies} from "@perfice/model/journal/search/ui";
import type {FormEntityProvider} from "@perfice/services/form/form";
import {journal, tagEntries} from "@perfice/stores";
import {navigate} from "@perfice/app";
import {TimeRangeType} from "@perfice/model/variable/time/time";
import {addDaysDate, dateToMidnight} from "@perfice/util/time/simple";

export function parseSearchFromUrl(param: string): SearchEntity[] {
    try {
        return JSON.parse(atob(param));
    } catch (ex) {
        console.log(ex)
        alert("Incorrectly formatted search")
        return [];
    }
}

export function constructSearchParam(search: SearchEntity[]): string {
    return btoa(JSON.stringify(search));
}

export function gotoEditSearch(entities: SearchEntity[]) {
    navigate(`/journal/search/${constructSearchParam(entities)}`);
}


export function gotoJournalSearch(entities: SearchEntity[]) {
    navigate(`/journal/${constructSearchParam(entities)}`);
}

export function createJournalDateSearch(date: Date): SearchEntity[] {
    return [
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
                    type: TimeRangeType.BETWEEN,
                    lower: dateToMidnight(date).getTime(),
                    upper: addDaysDate(dateToMidnight(date), 1).getTime() - 1000
                }
            }
        },
    ];
}

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
