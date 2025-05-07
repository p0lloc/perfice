import {expect, test} from "vitest";
import {
    DummyFormService,
    DummyJournalCollection,
    DummyTagCollection,
    DummyTagEntryCollection
} from "../dummy-collections";
import {mockEntry, mockForm} from "./raw.test";
import {pNumber, pString} from "../../src/model/primitive/primitive";
import {AnalyticsService} from "../../src/services/analytics/analytics";
import {FormQuestionDataType} from "../../src/model/form/form";
import {SimpleTimeScopeType, WeekStart} from "../../src/model/variable/time/time";
import {AnalyticsSettings} from "../../src/model/analytics/analytics";


test("flatten quantitative values", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24)
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            })
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(1000 * 60 * 60 * 24 * 7), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings());

    expect(flattened).toEqual(new Map([
        ["test_form:test", new Map([
            [0, 15],
            [1000 * 60 * 60 * 24, 17]
        ])],
    ]));
});


test("filter matching timestamps", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 10),

        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24), // This should not be included since it's not in the first dataset

        mockEntry("test_form", {"test": pNumber(45.0)}, 1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form2", {"test": pNumber(10.0)}, 1000 * 60 * 60 * 24 * 3 - 20000),
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
            mockForm("test_form2", {
                "test": FormQuestionDataType.NUMBER
            })
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(1000 * 60 * 60 * 24 * 7), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings2());
    let matching = analytics.filterMatchingTimestamps(
        flattened.get("test_form:test")!, flattened.get("test_form2:test")!,
        false,
        false,
        new Date(1000 * 60 * 60 * 24 * 7),
        SimpleTimeScopeType.DAILY,
        7
    );

    expect(matching).toEqual({
        first: [15, 45],
        second: [17, 10],
        timestamps: [0, 1000 * 60 * 60 * 24 * 3]
    });
});


test("filter matching timestamps with lag", async () => {
    const journal = new DummyJournalCollection([

        // Timestamp for 0 should be matched with the next day since it's lagged
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0),

        mockEntry("test_form2", {"test": pNumber(55.0)}, 1000 * 60 * 60 * 24),

        // This should also be matched with the next day
        mockEntry("test_form", {"test": pNumber(45.0)}, 1000 * 60 * 60 * 24 * 2),

        mockEntry("test_form2", {"test": pNumber(30.0)}, 1000 * 60 * 60 * 24 * 3 - 20000),
        mockEntry("test_form2", {"test": pNumber(70.0)}, 1000 * 60 * 60 * 24 * 3 - 30000),

        // This should not be included at all
        mockEntry("test_form", {"test": pNumber(50.0)}, 1000 * 60 * 60 * 24 * 3),
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
            mockForm("test_form2", {
                "test": FormQuestionDataType.NUMBER
            })
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(1000 * 60 * 60 * 24 * 7), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings2());
    let matching = analytics.filterMatchingTimestamps(
        flattened.get("test_form:test")!, flattened.get("test_form2:test")!,
        false,
        false,
        new Date(1000 * 60 * 60 * 24 * 7),
        SimpleTimeScopeType.DAILY,
        7,
        true
    );

    expect(matching).toEqual({
        first: [15, 45],
        second: [55, 50],
        timestamps: [0, 1000 * 60 * 60 * 24 * 2]
    });
});

test("filter matching timestamps with lag, whole range", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(99.0)}, -1000 * 60 * 60 * 24 * 4),
        mockEntry("test_form2", {"test": pNumber(33.0)}, -1000 * 60 * 60 * 24 * 3),
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
            mockForm("test_form2", {
                "test": FormQuestionDataType.NUMBER
            })
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(0), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings2());
    let matching = analytics.filterMatchingTimestamps(
        flattened.get("test_form:test")!, flattened.get("test_form2:test")!,
        true,
        true,
        new Date(0),
        SimpleTimeScopeType.DAILY,
        7,
        true
    );

    expect(matching).toEqual({
        // Note: The timestamp will still be 4 days ago, since that is when the first value "caused" the second value on the next day
        // High steps (99) on day 4 caused high mood (33) on the next day
        first: [0, 0, 99, 0, 0, 0],
        second: [0, 0, 33, 0, 0, 0],
        timestamps: [
            -1000 * 60 * 60 * 24 * 6,
            -1000 * 60 * 60 * 24 * 5,
            -1000 * 60 * 60 * 24 * 4,
            -1000 * 60 * 60 * 24 * 3,
            -1000 * 60 * 60 * 24 * 2,
            -1000 * 60 * 60 * 24 * 1,
        ]
    });
})

test("filter matching timestamps with categorical non-empty", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0),
        mockEntry("test_form2", {"test": pString("category1")}, 10),

        mockEntry("test_form2", {"test": pString("category1")}, 1000 * 60 * 60 * 24), // This should not be included since it's not in the first dataset

        mockEntry("test_form", {"test": pNumber(45.0)}, 1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form2", {"test": pString("category1")}, 1000 * 60 * 60 * 24 * 3 - 20000),
        mockEntry("test_form2", {"test": pString("category1")}, 1000 * 60 * 60 * 24 * 3 - 30000),
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
            mockForm("test_form2", {
                "test": FormQuestionDataType.TEXT
            })
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(1000 * 60 * 60 * 24 * 7), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings2());
    let matching = analytics.filterMatchingTimestamps(
        flattened.get("test_form:test")!,
        flattened.get("cat_test_form2:test:category1")!,
        false,
        false,
        new Date(1000 * 60 * 60 * 24 * 7),
        SimpleTimeScopeType.DAILY,
        7
    );

    expect(matching).toEqual({
        first: [15, 45],
        second: [1, 2],
        timestamps: [0, 1000 * 60 * 60 * 24 * 3]
    });
});


test("filter matching timestamps with categorical empty", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0),
        // Test_form2 is missing data for timestamp 0 but we allow empty

        mockEntry("test_form", {"test": pNumber(45.0)}, 1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form2", {"test": pString("category1")}, 1000 * 60 * 60 * 24 * 3 - 20000),
        mockEntry("test_form2", {"test": pString("category1")}, 1000 * 60 * 60 * 24 * 3 - 30000),

        // First still doesn't allow empty so this shouldn't be included
        mockEntry("test_form2", {"test": pString("category1")}, 1000 * 60 * 60 * 24 * 4),

        mockEntry("test_form", {"test": pNumber(69.0)}, 1000 * 60 * 60 * 24 * 5),
        // Test_form2 is missing data for day 5 but we allow empty
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
            mockForm("test_form2", {
                "test": FormQuestionDataType.TEXT
            })
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(1000 * 60 * 60 * 24 * 7), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings2());
    let matching = analytics.filterMatchingTimestamps(
        flattened.get("test_form:test")!,
        flattened.get("cat_test_form2:test:category1")!,
        false,
        true,
        new Date(1000 * 60 * 60 * 24 * 7),
        SimpleTimeScopeType.DAILY,
        7
    );

    expect(matching).toEqual({
        first: [15, 45, 69],
        second: [0, 2, 0],
        timestamps: [0, 1000 * 60 * 60 * 24 * 3, 1000 * 60 * 60 * 24 * 5]
    });
});

test("filter matching timestamps with categorical empty, order switched", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0),
        // Test_form2 is missing data for timestamp 0 but we allow empty

        mockEntry("test_form", {"test": pNumber(45.0)}, 1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form2", {"test": pString("category1")}, 1000 * 60 * 60 * 24 * 3 - 20000),
        mockEntry("test_form2", {"test": pString("category1")}, 1000 * 60 * 60 * 24 * 3 - 30000),

        // First still doesn't allow empty so this shouldn't be included
        mockEntry("test_form2", {"test": pString("category1")}, 1000 * 60 * 60 * 24 * 4),

        mockEntry("test_form", {"test": pNumber(69.0)}, 1000 * 60 * 60 * 24 * 5),
        // Test_form2 is missing data for day 5 but we allow empty
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
            mockForm("test_form2", {
                "test": FormQuestionDataType.TEXT
            })
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(1000 * 60 * 60 * 24 * 7), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings2());
    let matching = analytics.filterMatchingTimestamps(
        flattened.get("cat_test_form2:test:category1")!,
        flattened.get("test_form:test")!,
        true,
        false,
        new Date(1000 * 60 * 60 * 24 * 7),
        SimpleTimeScopeType.DAILY,
        7
    );

    expect(matching).toEqual({
        first: [0, 2, 0],
        second: [15, 45, 69],
        timestamps: [0, 1000 * 60 * 60 * 24 * 3, 1000 * 60 * 60 * 24 * 5]
    });
});


test("filter matching timestamps with both empty", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0),

        mockEntry("test_form", {"test": pNumber(45.0)}, -1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form2", {"test": pString("category1")}, -1000 * 60 * 60 * 24 * 3 - 20000),
        mockEntry("test_form2", {"test": pString("category1")}, -1000 * 60 * 60 * 24 * 3 - 30000),

        mockEntry("test_form2", {"test": pString("category1")}, -1000 * 60 * 60 * 24 * 4),

        mockEntry("test_form", {"test": pNumber(69.0)}, -1000 * 60 * 60 * 24 * 5),
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
            mockForm("test_form2", {
                "test": FormQuestionDataType.TEXT
            })
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(0), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings2());
    let matching = analytics.filterMatchingTimestamps(
        flattened.get("test_form:test")!,
        flattened.get("cat_test_form2:test:category1")!,
        true,
        true,
        new Date(0),
        SimpleTimeScopeType.DAILY,
        7
    );

    expect(matching).toEqual({
        first: [0, 69, 0, 45, 0, 0, 15],
        second: [0, 0, 1, 2, 0, 0, 0],
        timestamps: [
            -1000 * 60 * 60 * 24 * 6,
            -1000 * 60 * 60 * 24 * 5,
            -1000 * 60 * 60 * 24 * 4,
            -1000 * 60 * 60 * 24 * 3,
            -1000 * 60 * 60 * 24 * 2,
            -1000 * 60 * 60 * 24 * 1,
            0
        ]
    });
});

test("flatten categorical values", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pString("category1")}, 0),
        mockEntry("test_form", {"test": pString("category1")}, 0),
        mockEntry("test_form", {"test": pString("category2")}, 1000 * 60 * 60 * 24),
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.TEXT
            })
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(1000 * 60 * 60 * 24 * 7), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings());

    expect(flattened).toEqual(new Map([
        ["cat_test_form:test:category1", new Map([
            [0, 2],
        ])],
        ["cat_test_form:test:category2", new Map([
            [1000 * 60 * 60 * 24, 1]
        ])]
    ]));
});

test("week day dataset is_monday", async () => {
    const journal = new DummyJournalCollection([]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(), journal, tags, tagEntries, WeekStart.MONDAY);

    let dataset = analytics.generateSingleWeekDayDataSet(SimpleTimeScopeType.DAILY, new Date(0), 7, 1);
    expect(dataset).toEqual(new Map([
        [-1000 * 60 * 60 * 24 * 6, 0],
        [-1000 * 60 * 60 * 24 * 5, 0],
        [-1000 * 60 * 60 * 24 * 4, 0],
        [-1000 * 60 * 60 * 24 * 3, 1], // This should be monday
        [-1000 * 60 * 60 * 24 * 2, 0],
        [-1000 * 60 * 60 * 24 * 1, 0],
        [-1000 * 60 * 60 * 24 * 0, 0], // Thursday
    ]));
});

test("week day dataset is_tuesday", async () => {
    const journal = new DummyJournalCollection([]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(), journal, tags, tagEntries, WeekStart.MONDAY);

    let dataset = analytics.generateSingleWeekDayDataSet(SimpleTimeScopeType.DAILY, new Date(0), 7, 2);
    expect(dataset).toEqual(new Map([
        [-1000 * 60 * 60 * 24 * 6, 0],
        [-1000 * 60 * 60 * 24 * 5, 0],
        [-1000 * 60 * 60 * 24 * 4, 0],
        [-1000 * 60 * 60 * 24 * 3, 0],
        [-1000 * 60 * 60 * 24 * 2, 1], // This should be tuesday
        [-1000 * 60 * 60 * 24 * 1, 0],
        [-1000 * 60 * 60 * 24 * 0, 0], // Thursday
    ]));
});

function mockAnalyticsSettings(): AnalyticsSettings[] {
    return [{
        formId: "test_form",
        questionId: "test",
        useMeanValue: {"test": true},
        interpolate: false
    }]
}


function mockAnalyticsSettings2(): AnalyticsSettings[] {
    return [{
        formId: "test_form",
        questionId: "test",
        useMeanValue: {"test": true},
        interpolate: false
    },
        {
            formId: "test_form2",
            questionId: "test",
            useMeanValue: {"test": true},
            interpolate: false
        }
    ]
}

test("filter matching timestamps with week day dataset", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0),
        mockEntry("test_form", {"test": pNumber(45.0)}, -1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form", {"test": pNumber(69.0)}, -1000 * 60 * 60 * 24 * 5),
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(0), 7);
    let [values] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let flattened = analytics.flattenRawValues(values, mockAnalyticsSettings());
    let mondayDataset = analytics.generateSingleWeekDayDataSet(SimpleTimeScopeType.DAILY, new Date(0), 7, 1);
    flattened.set("is_monday", mondayDataset);

    let matching = analytics.filterMatchingTimestamps(
        flattened.get("test_form:test")!,
        flattened.get("is_monday")!,
        true,
        true,
        new Date(0),
        SimpleTimeScopeType.DAILY,
        7
    );

    expect(matching).toEqual({
        first: [0, 69, 0, 45, 0, 0, 15],
        second: [0, 0, 0, 1, 0, 0, 0],
        timestamps: [
            -1000 * 60 * 60 * 24 * 6,
            -1000 * 60 * 60 * 24 * 5,
            -1000 * 60 * 60 * 24 * 4,
            -1000 * 60 * 60 * 24 * 3,
            -1000 * 60 * 60 * 24 * 2,
            -1000 * 60 * 60 * 24 * 1,
            0
        ]
    });
});

test("basic correlation", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0),
        mockEntry("test_form", {"test": pNumber(45.0)}, -1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form", {"test": pNumber(69.0)}, -1000 * 60 * 60 * 24 * 5),
        mockEntry("test_form2", {"test": pNumber(69.0)}, -1000 * 60 * 60 * 24 * 5),
        mockEntry("test_form3", {"test": pString("cat1")}, -1000 * 60 * 60 * 24 * 5),
    ]);
    const tagEntries = new DummyTagEntryCollection([]);
    const tags = new DummyTagCollection([]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
            mockForm("test_form2", {
                "test": FormQuestionDataType.NUMBER
            }),
            mockForm("test_form3", {
                "test": FormQuestionDataType.TEXT,
            }),
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let [forms, entries] = await analytics.fetchFormsAndEntries(new Date(1000 * 60 * 60 * 24 * 7), 7);
    let [rawValues] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let [tagValues] = await analytics.fetchTagValues(SimpleTimeScopeType.DAILY, new Date(1000 * 60 * 60 * 24 * 7), 7);
    await analytics.runBasicCorrelations(rawValues, tagValues, mockAnalyticsSettings(), new Date(1000 * 60 * 60 * 24 * 7), 7, 3);
});
