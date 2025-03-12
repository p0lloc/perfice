import {expect, test} from "vitest";
import {
    DummyFormService,
    DummyJournalCollection,
    DummyTagCollection,
    DummyTagEntryCollection
} from "../dummy-collections";
import {AnalyticsService} from "../../src/services/analytics/analytics";
import {SimpleTimeScopeType} from "../../src/model/variable/time/time";

test("basic tag values", async () => {
    const journal = new DummyJournalCollection([]);
    const tagEntries = new DummyTagEntryCollection([
        {
            id: crypto.randomUUID(),
            tagId: "test_tag",
            timestamp: 0,
        },
        {
            id: crypto.randomUUID(),
            tagId: "test_tag",
            timestamp: -1000 * 60 * 60 * 24 * 5 + 13337,
        },
    ]);
    const tags = new DummyTagCollection([
        {
            id: "test_tag",
            name: "Test tag",
            variableId: "",
            categoryId: ""
        }
    ]);
    const analytics = new AnalyticsService(new DummyFormService(
        [],
    ), journal, tags, tagEntries);

    let values = await analytics.fetchTagValues(SimpleTimeScopeType.DAILY, new Date(0), 7);

    expect(values).toEqual(new Map([
        ["test_tag", new Map([
            [0, 1],
            [-1000 * 60 * 60 * 24 * 1, 0],
            [-1000 * 60 * 60 * 24 * 2, 0],
            [-1000 * 60 * 60 * 24 * 3, 0],
            [-1000 * 60 * 60 * 24 * 4, 0],
            [-1000 * 60 * 60 * 24 * 5, 1],
            [-1000 * 60 * 60 * 24 * 6, 0],
        ])]
    ]));
})