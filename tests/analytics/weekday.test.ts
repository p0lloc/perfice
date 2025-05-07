import {expect, test} from "vitest";
import {
    DummyFormService,
    DummyJournalCollection,
    DummyTagCollection,
    DummyTagEntryCollection
} from "../dummy-collections";
import {pNumber, pString} from "../../src/model/primitive/primitive";
import {aCategoricalFrequency, AnalyticsService, aValue} from "../../src/services/analytics/analytics";
import {FormQuestionDataType} from "../../src/model/form/form";
import {SimpleTimeScopeType, WeekStart} from "../../src/model/variable/time/time";
import {mockEntry, mockForm} from "./raw.test";

test("basic quantitative weekdays", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0), // Weekday 4
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 7), // Weekday 4
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24) // Weekday 5
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
    let weekDayValues = await analytics.calculateFormWeekDayAnalytics("test",
        values.get("test_form")!.get("test"), {
            formId: "test_form",
            useMeanValue: {
                "test": true
            }
        });

    expect(weekDayValues).toEqual(
        {
            quantitative: true,
            value: {
                values: new Map([
                    [0, aValue(0, 0)],
                    [1, aValue(0, 0)],
                    [2, aValue(0, 0)],
                    [3, aValue(0, 0)],
                    [4, aValue(15, 2)],
                    [5, aValue(17, 1)],
                    [6, aValue(0, 0)]
                ]),
                min: 4,
                max: 5
            }
        }
    );

})

test("basic categorical weekdays", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pString("category1")}, 0), // Weekday 4
        mockEntry("test_form", {"test": pString("category1")}, 0), // Weekday 4
        mockEntry("test_form", {"test": pString("category2")}, 1000 * 60 * 60 * 24), // Weekday 5
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
    let weekDayValues = await analytics.calculateFormWeekDayAnalytics("test",
        values.get("test_form")!.get("test"), {
            formId: "test_form",
            useMeanValue: {
                "test": true
            }
        });

    expect(weekDayValues).toEqual(
        {
            quantitative: false,
            value: {
                values: new Map([
                    [0, null],
                    [1, null],
                    [2, null],
                    [3, null],
                    [4, aCategoricalFrequency("category1", 2)],
                    [5, aCategoricalFrequency("category2", 1)],
                    [6, null]
                ]),
            }
        }
    );

})

test("basic categorical weekdays with multiple", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pString("category1")}, 0), // Weekday 4
        mockEntry("test_form", {"test": pString("category1")}, 0), // Weekday 4
        mockEntry("test_form", {"test": pString("category3")}, 0), // Weekday 4
        mockEntry("test_form", {"test": pString("category3")}, 0), // Weekday 4
        mockEntry("test_form", {"test": pString("category3")}, 1000 * 60 * 60 * 24 * 7), // Weekday 4, one week later
        mockEntry("test_form", {"test": pString("category2")}, 1000 * 60 * 60 * 24), // Weekday 5
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
    let weekDayValues = await analytics.calculateFormWeekDayAnalytics("test",
        values.get("test_form")!.get("test"), {
            formId: "test_form",
            useMeanValue: {
                "test": true
            }
        });

    expect(weekDayValues).toEqual(
        {
            quantitative: false,
            value: {
                values: new Map([
                    [0, null],
                    [1, null],
                    [2, null],
                    [3, null],
                    [4, aCategoricalFrequency("category3", 3)],
                    [5, aCategoricalFrequency("category2", 1)],
                    [6, null]
                ]),
            }
        }
    );

})
