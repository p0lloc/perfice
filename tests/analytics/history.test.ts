import {expect, test} from "vitest";
import {
    DummyFormService,
    DummyJournalCollection,
    DummyTagCollection,
    DummyTagEntryCollection
} from "../dummy-collections";
import {mockEntry, mockForm} from "./raw.test";
import {pNumber} from "../../src/model/primitive/primitive";
import {AnalyticsHistoryService} from "../../src/services/analytics/history";
import {AnalyticsService} from "../../src/services/analytics/analytics";
import {FormQuestionDataType} from "../../src/model/form/form";
import {SimpleTimeScopeType, WeekStart} from "../../src/model/variable/time/time";
import {AnalyticsSettings} from "../../src/model/analytics/analytics";


function mockAnalyticsSettings(): AnalyticsSettings[] {
    return [
        {
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

test("saves history successfully", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 1),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 2),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 4),

        mockEntry("test_form2", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 1),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 2),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 4),
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
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    let date = new Date(1000 * 60 * 60 * 24 * 7);

    let [forms, entries] = await analytics.fetchFormsAndEntries(date, 7);
    let [rawValues] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);

    let [tagValues] = await analytics.fetchTagValues(SimpleTimeScopeType.DAILY, date, 7);
    let results = await analytics.runBasicCorrelations(rawValues, tagValues, mockAnalyticsSettings(), date, 7, 3);

    const history = new AnalyticsHistoryService(0.5, 0.3);
    history.processResult(results, date);

    // Load again from local storage
    const newHistory = new AnalyticsHistoryService(0.5, 0.3);
    newHistory.load();
    let historyEntries = newHistory.getNewestCorrelations(5, date.getTime());
    expect(historyEntries).toEqual([
        {
            key: "test_form:test|test_form2:test",
            coefficient: expect.closeTo(1.0, 5),
            timestamp: date.getTime()
        }
    ])
});

test("timestamp remains same", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 1),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 2),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 4),

        mockEntry("test_form2", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 1),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 2),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 4),
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
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    // Process and store in history
    let date1 = new Date(1000 * 60 * 60 * 24 * 7);
    let [forms, entries] = await analytics.fetchFormsAndEntries(date1, 7);
    let [rawValues1] = await analytics.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY);
    let [tagValues1] = await analytics.fetchTagValues(SimpleTimeScopeType.DAILY, date1, 7);
    let results1 = await analytics.runBasicCorrelations(rawValues1, tagValues1, mockAnalyticsSettings(), date1, 7, 3);

    const history = new AnalyticsHistoryService(0.5, 0.3);
    history.processResult(results1, date1);

    // Calculate correlations the next day
    let date2 = new Date(1000 * 60 * 60 * 24 * 8);
    let [forms2, entries2] = await analytics.fetchFormsAndEntries(date2, 8);
    let [rawValues2] = await analytics.constructRawValues(forms2, entries2, SimpleTimeScopeType.DAILY);
    let [tagValues2] = await analytics.fetchTagValues(SimpleTimeScopeType.DAILY, date2, 8);
    let results2 = await analytics.runBasicCorrelations(rawValues2, tagValues2, mockAnalyticsSettings(), date2, 8, 3);
    history.processResult(results2, date2);

    // Load history from local storage
    // The timestamp should not have changed since the coefficient has not drastically changed
    const newHistory = new AnalyticsHistoryService(0.5, 0.3);
    newHistory.load();
    let historyEntries = newHistory.getNewestCorrelations(5, date1.getTime());
    expect(historyEntries).toEqual([
        {
            key: "test_form:test|test_form2:test",
            coefficient: expect.closeTo(1.0, 5),
            timestamp: date1.getTime()
        }
    ])
});

test("timestamp changes for drastic coefficient change", async () => {
    let firstMismatch = mockEntry("test_form", {"test": pNumber(14.5)}, 1000 * 60 * 60 * 24 * 3);
    let secondMismatch = mockEntry("test_form", {"test": pNumber(13.0)}, 1000 * 60 * 60 * 24 * 4);
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 1),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 2),
        firstMismatch,
        secondMismatch,

        mockEntry("test_form2", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 1),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 2),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 3),
        mockEntry("test_form2", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 4),
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
        ],
    ), journal, tags, tagEntries, WeekStart.MONDAY);

    // Process and store in history
    let date1 = new Date(1000 * 60 * 60 * 24 * 7);
    let [forms1, entries1] = await analytics.fetchFormsAndEntries(date1, 7);
    let [rawValues1] = await analytics.constructRawValues(forms1, entries1, SimpleTimeScopeType.DAILY);
    let [tagValues1] = await analytics.fetchTagValues(SimpleTimeScopeType.DAILY, date1, 7);
    let results1 = await analytics.runBasicCorrelations(rawValues1, tagValues1, mockAnalyticsSettings(), date1, 7, 3);

    const history = new AnalyticsHistoryService(0.5, 0.3);
    history.processResult(results1, date1);

    let historyEntries1 = history.getNewestCorrelations(5, date1.getTime());
    expect(historyEntries1).toEqual([
        {
            key: "lag_test_form2:test|test_form:test",
            coefficient: expect.closeTo(-0.548860, 5),
            timestamp: date1.getTime()
        },
        {
            key: "test_form:test|test_form2:test",
            coefficient: expect.closeTo(0.527777, 5),
            timestamp: date1.getTime()
        },
    ])

    // Update the datasets to have much more closely related values, significantly increasing the correlation
    journal.updateEntry({...firstMismatch, answers: {"test": pNumber(16.0)}});
    journal.updateEntry({...secondMismatch, answers: {"test": pNumber(16.0)}});

    journal.createEntry(mockEntry("test_form", {"test": pNumber(13.0)}, 1000 * 60 * 60 * 24 * 5));
    journal.createEntry(mockEntry("test_form2", {"test": pNumber(13.0)}, 1000 * 60 * 60 * 24 * 5));

    journal.createEntry(mockEntry("test_form", {"test": pNumber(13.0)}, 1000 * 60 * 60 * 24 * 6));
    journal.createEntry(mockEntry("test_form2", {"test": pNumber(13.0)}, 1000 * 60 * 60 * 24 * 6));

    let date2 = new Date(1000 * 60 * 60 * 24 * 8);
    let [forms2, entries2] = await analytics.fetchFormsAndEntries(date2, 8);
    let [rawValues2] = await analytics.constructRawValues(forms2, entries2, SimpleTimeScopeType.DAILY);
    let [tagValues2] = await analytics.fetchTagValues(SimpleTimeScopeType.DAILY, date2, 8);
    let results2 = await analytics.runBasicCorrelations(rawValues2, tagValues2, mockAnalyticsSettings(), date2, 8, 3);
    history.processResult(results2, date2);

    // Load history from local storage
    const newHistory = new AnalyticsHistoryService(0.5, 0.3);
    newHistory.load();
    let historyEntries2 = history.getNewestCorrelations(5, date2.getTime());
    expect(historyEntries2).toEqual([
        {
            key: "test_form:test|test_form2:test",
            coefficient: expect.closeTo(0.977008, 5),
            timestamp: date2.getTime() // Timestamp should now have changed since the coefficient drastically changed
        },
        {
            key: "test_form:test|wd_Thursday",
            coefficient: expect.closeTo(-0.639135, 5),
            timestamp: date2.getTime()
        },
        {
            key: "test_form2:test|wd_Thursday",
            coefficient: expect.closeTo(-0.63647, 5),
            timestamp: date2.getTime()
        }
    ])
});
