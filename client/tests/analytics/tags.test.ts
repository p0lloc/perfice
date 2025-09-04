import {expect, test} from "vitest";
import {
    DummyFormService,
    DummyJournalCollection,
    DummyTagCollection,
    DummyTagEntryCollection
} from "../dummy-collections";
import {AnalyticsService} from "../../src/services/analytics/analytics";
import {SimpleTimeScopeType, WeekStart} from "../../src/model/variable/time/time";

test("basic tag values", async () => {
    const journal = new DummyJournalCollection([]);
    const tagEntries = new DummyTagEntryCollection([
        {
            id: crypto.randomUUID(),
            tagId: "test_tag",
            timestamp: new Date(1970, 0, 1).getTime(),
        },
        {
            id: crypto.randomUUID(),
            tagId: "test_tag",
            timestamp: new Date(1970, 0, -5).getTime(),
        },
    ]);
    const tags = new DummyTagCollection([
        {
            id: "test_tag",
            name: "Test tag",
            variableId: "",
            categoryId: "",
            order: 0
        }
    ]);
    const analytics = new AnalyticsService(new DummyFormService(
        [],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [values] = await analytics.fetchTagValues(SimpleTimeScopeType.DAILY, new Date(1970, 0, 1), 7);

    expect(values).toEqual(new Map([
        ["tag_test_tag", new Map([
            [new Date(1970, 0, 1).getTime(), 1],
            [new Date(1970, 0, 0).getTime(), 0],
            [new Date(1970, 0, -1).getTime(), 0],
            [new Date(1970, 0, -2).getTime(), 0],
            [new Date(1970, 0, -3).getTime(), 0],
            [new Date(1970, 0, -4).getTime(), 0],
            [new Date(1970, 0, -5).getTime(), 1],
        ])]
    ]));
})

test("tag weekday analytics", async () => {
    const journal = new DummyJournalCollection([]);
    const tagEntries = new DummyTagEntryCollection([
        {
            id: crypto.randomUUID(),
            tagId: "test_tag",
            timestamp: new Date(1970, 0, 1).getTime(), // Week day Thursday
        },
        {
            id: crypto.randomUUID(),
            tagId: "test_tag",
            timestamp: new Date(1970, 0, -6).getTime(), // Also Week day Thursday
        },
        {
            id: crypto.randomUUID(),
            tagId: "test_tag",
            timestamp: new Date(1970, 0, -4).getTime(), // Saturday
        },
    ]);
    const tags = new DummyTagCollection([
        {
            id: "test_tag",
            name: "Test tag",
            variableId: "",
            categoryId: "",
            order: 0
        }
    ]);
    const analytics = new AnalyticsService(new DummyFormService(
        [],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [values] = await analytics.fetchTagValues(SimpleTimeScopeType.DAILY, new Date(1970, 0, 1), 10);
    let weekDayAnalytics = await analytics.calculateTagWeekDayAnalytics(values.get("tag_test_tag"));

    expect(weekDayAnalytics).toEqual({
        values: new Map([
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 2],
            [5, 0],
            [6, 1],
        ]),
        min: 0, max: 4
    });
})
