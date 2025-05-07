import {expect, test} from "vitest";
import {
    DummyFormService,
    DummyJournalCollection,
    DummyTagCollection,
    DummyTagEntryCollection
} from "../dummy-collections";
import {pNumber, pString} from "../../src/model/primitive/primitive";
import {AnalyticsService} from "../../src/services/analytics/analytics";
import {FormQuestionDataType} from "../../src/model/form/form";
import {SimpleTimeScopeType, WeekStart} from "../../src/model/variable/time/time";
import {mockEntry, mockForm} from "./raw.test";


test("basic quantitative values", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 2)
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
    let basic = await analytics.calculateBasicAnalytics("test", values.get("test_form")!.get("test")!, {
        formId: "test_form",
        useMeanValue: {
            "test": true
        }
    });

    expect(basic).toEqual({
        quantitative: true,
        value: {
            average: 15.0,
            max: {
                timestamp: 1000 * 60 * 60 * 24 * 2,
                value: 17
            },
            min: {
                timestamp: 0,
                value: 13
            }
        }
    });
})


test("basic categorical values", async () => {
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
    let categorical = await analytics.calculateBasicAnalytics("test", values.get("test_form")!.get("test")!, {
        formId: "test_form",
        useMeanValue: {
            "test": false
        }
    });

    expect(categorical).toEqual({
        quantitative: false,
        value: {
            mostCommon: {
                category: "category1",
                frequency: 2
            },
            leastCommon: {
                category: "category2",
                frequency: 1
            }
        }
    });
});