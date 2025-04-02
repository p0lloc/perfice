import {expect, test} from "vitest";
import {JournalSearchService} from "../../src/services/journal/search";
import {Trackable, TrackableCategory} from "../../src/model/trackable/trackable";
import {TrackableEntityProvider} from "../../src/services/trackable/trackable";
import {TrackableCategoryEntityProvider} from "../../src/services/trackable/category";
import {TagEntityProvider} from "../../src/services/tag/tag";
import {Tag, TagCategory} from "../../src/model/tag/tag";
import {TagCategoryEntityProvider} from "../../src/services/tag/category";
import {DummyJournalCollection, DummyTagEntryCollection} from "../dummy-collections";
import {SearchEntityType} from "../../src/model/journal/search/search";
import {FormEntityProvider} from "../../src/services/form/form";
import {Form} from "../../src/model/form/form";
import {TrackableSearchFilterType} from "../../src/model/journal/search/trackable";
import {FilterComparisonOperator} from "../../src/services/variable/filtering";
import {pNumber} from "../../src/model/primitive/primitive";

export class DummyTrackableEntityProvider implements TrackableEntityProvider {

    private readonly trackables: Trackable[];

    constructor(trackables: Trackable[] = []) {
        this.trackables = trackables;
    }

    async getTrackables(): Promise<Trackable[]> {
        return this.trackables;
    }

}

export class DummyTrackableCategoryEntityProvider implements TrackableCategoryEntityProvider {

    private readonly categories: TrackableCategory[];

    constructor(categories: TrackableCategory[] = []) {
        this.categories = categories;
    }

    async getCategories(): Promise<TrackableCategory[]> {
        return this.categories;
    }

}

export class DummyTagEntityProvider implements TagEntityProvider {

    private readonly tags: Tag[];

    constructor(tags: Tag[] = []) {
        this.tags = tags;
    }

    async getTags(): Promise<Tag[]> {
        return this.tags;
    }

}

export class DummyTagCategoryEntityProvider implements TagCategoryEntityProvider {

    private readonly categories: TagCategory[];

    constructor(categories: TagCategory[] = []) {
        this.categories = categories;
    }

    async getCategories(): Promise<TagCategory[]> {
        return this.categories;
    }

}

export class DummyFormEntityProvider implements FormEntityProvider {
    private readonly forms: Form[];

    constructor(forms: Form[] = []) {
        this.forms = forms;
    }

    async getForms(): Promise<Form[]> {
        return this.forms;
    }
}

function createMockSearchService() {
    return new JournalSearchService(new DummyJournalCollection(
            [
                {
                    id: "test",
                    formId: "test",
                    answers: {},
                    timestamp: 0,
                    displayValue: "test",
                    snapshotId: ""
                },
                {
                    id: "test2",
                    formId: "test2",
                    answers: {
                        "test": pNumber(13.0)
                    },
                    timestamp: 0,
                    displayValue: "test",
                    snapshotId: ""
                }
            ]
        ),
        new DummyTagEntryCollection(
            [
                {
                    id: "test",
                    tagId: "test",
                    timestamp: 0,
                }
            ]
        ),
        new DummyTrackableEntityProvider(
            [
                {
                    id: "test",
                    formId: "test",
                    categoryId: null,
                } as Trackable, // Only props necessary for mock,
                {
                    id: "test2",
                    formId: "test2",
                    categoryId: "test",
                } as Trackable
            ]
        ),
        new DummyTagEntityProvider(
            [
                {
                    id: "test",
                    categoryId: null,
                } as Tag // Only props necessary for mock
            ]
        ), new DummyFormEntityProvider())
}

test("search all trackables", async () => {
    let search = createMockSearchService();

    expect(await search.searchAll([
            {
                id: "test",
                include: true,
                type: SearchEntityType.TRACKABLE,
                value: {
                    filters: []
                }
            }
        ]
    )).toEqual({
        journalEntries: [
            {
                id: "test",
                formId: "test",
                answers: {},
                timestamp: 0,
                displayValue: "test",
                snapshotId: ""
            },

            {
                id: "test2",
                formId: "test2",
                answers: {
                    "test": pNumber(13.0)
                },
                timestamp: 0,
                displayValue: "test",
                snapshotId: ""
            }
        ],
        tagEntries: []
    });
});

test("search all tags", async () => {
    let search = createMockSearchService();

    expect(await search.searchAll([
            {
                id: "test",
                include: true,
                type: SearchEntityType.TAG,
                value: {
                    filters: []
                }
            }
        ]
    )).toEqual({
        journalEntries: [],
        tagEntries: [
            {
                id: "test",
                tagId: "test",
                timestamp: 0,
            }
        ]
    });
})

test("search by trackable category", async () => {
    let search = createMockSearchService();

    expect(await search.searchAll(
        [
            {
                id: "test",
                include: true,
                type: SearchEntityType.TRACKABLE,
                value: {
                    filters: [
                        {
                            type: TrackableSearchFilterType.BY_CATEGORY,
                            value: {
                                categories: ["test"]
                            }
                        }
                    ]
                }
            }
        ]
    )).toEqual({
        journalEntries: [
            {
                id: "test2",
                formId: "test2",
                answers: {
                    "test": pNumber(13.0)
                },
                timestamp: 0,
                displayValue: "test",
                snapshotId: ""
            }
        ],
        tagEntries: []
    });
})

test("search by answers", async () => {
    let search = createMockSearchService();

    expect(await search.searchAll(
        [
            {
                id: "test",
                include: true,
                type: SearchEntityType.TRACKABLE,
                value: {
                    filters: [
                        {
                            type: TrackableSearchFilterType.ONE_OF,
                            value: {
                                values: ["test2"]
                            }
                        },
                        {
                            type: TrackableSearchFilterType.BY_ANSWERS,
                            value: {
                                filters: [
                                    {
                                        id: crypto.randomUUID(),
                                        field: "test",
                                        operator: FilterComparisonOperator.EQUAL,
                                        value: pNumber(13.0)
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    )).toEqual({
        journalEntries: [
            {
                id: "test2",
                formId: "test2",
                answers: {
                    "test": pNumber(13.0)
                },
                timestamp: 0,
                displayValue: "test",
                snapshotId: ""
            }
        ],
        tagEntries: []
    });
})
