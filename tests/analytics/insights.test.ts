import {expect, test} from "vitest";
import {
    DummyFormService,
    DummyJournalCollection,
    DummyTagCollection,
    DummyTagEntryCollection
} from "../dummy-collections";
import {mockEntry, mockForm} from "./raw.test";
import {pNumber} from "../../src/model/primitive/primitive";
import {AnalyticsService} from "../../src/services/analytics/analytics";
import {FormQuestionDataType} from "../../src/model/form/form";
import {SimpleTimeScopeType, WeekStart} from "../../src/model/variable/time/time";

test("insights with an outlier", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 2),
        mockEntry("test_form", {"test": pNumber(3.0)}, 1000 * 60 * 60 * 24 * 4)
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
    const allSettings = [{
        formId: "test_form",
        useMeanValue: {
            "test": true
        }
    }];
    let allBasic = await analytics.calculateAllBasicAnalytics(values, allSettings);

    let insights = await analytics.findHistoricalQuantitativeInsights(values, allBasic, new Date(1000 * 60 * 60 * 24 * 4),
        SimpleTimeScopeType.DAILY, allSettings);

    expect(insights).toEqual([
        {
            average: 11,
            current: 3,
            diff: expect.closeTo(0.72727, 4),
            error: expect.closeTo(0.2727, 4),
            formId: "test_form",
            questionId: "test"
        }
    ]);

})

test("insights with no outlier", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 1000 * 60 * 60 * 24 * 2),
        mockEntry("test_form", {"test": pNumber(14.0)}, 1000 * 60 * 60 * 24 * 4)
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
    const allSettings = [{
        formId: "test_form",
        useMeanValue: {
            "test": true
        }
    }];
    let allBasic = await analytics.calculateAllBasicAnalytics(values, allSettings);

    let insights = await analytics.findHistoricalQuantitativeInsights(values, allBasic, new Date(1000 * 60 * 60 * 24 * 4),
        SimpleTimeScopeType.DAILY, allSettings);

    expect(insights).toEqual([]);

})
