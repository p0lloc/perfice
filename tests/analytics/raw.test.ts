import {expect, test} from "vitest";
import {DummyFormService, DummyJournalCollection} from "../dummy-collections";
import {AnalyticsService} from "../../src/services/analytics/analytics";
import {SimpleTimeScopeType} from "../../src/model/variable/time/time";
import {Form, FormQuestion, FormQuestionDataType} from "../../src/model/form/form";
import {pNumber, pString} from "../../src/model/primitive/primitive";
import {JournalEntry} from "../../src/model/journal/journal";

export function mockEntry(formId: string, answers: Record<string, any>, timestamp: number): JournalEntry {
    return {
        id: "test",
        formId: formId,
        answers: answers,
        timestamp: timestamp,
        snapshotId: "",
        name: "",
        icon: "",
        displayValue: ""
    }
}

export function mockForm(id: string, questions: Record<string, FormQuestionDataType>): Form {
    let q: FormQuestion[] = [];
    for (let [questionId, dataType] of Object.entries(questions)) {
        q.push({
            id: questionId,
            name: questionId,
            unit: null,
            dataType: dataType,
            dataSettings: {}
        });
    }
    return {
        id: id,
        name: "Test",
        icon: "",
        format: [],
        snapshotId: "",
        questions: q
    }
}

test("basic raw values single", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0)
    ]);

    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            }),
        ]
    ), journal);

    let [values] = await analytics.fetchRawValues(SimpleTimeScopeType.DAILY, 7);
    expect(values).toEqual(new Map([
        ["test_form", new Map([
            ["test", {
                values: new Map([[
                    0, {count: 1, value: 13.0}
                ]]), quantitative: true
            }]
        ])]
    ]));
});


test("basic raw quantitative values multiple", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pNumber(13.0)}, 0),
        mockEntry("test_form", {"test": pNumber(17.0)}, 0)
    ]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.NUMBER
            })
        ],
    ), journal);

    let [values] = await analytics.fetchRawValues(SimpleTimeScopeType.DAILY, 7);
    expect(values).toEqual(new Map([
        ["test_form", new Map([
            ["test", {
                values: new Map([[
                    0, {count: 2, value: 30.0}
                ]]), quantitative: true
            }]
        ])]
    ]));
})

test("basic raw categorical values multiple", async () => {
    const journal = new DummyJournalCollection([
        mockEntry("test_form", {"test": pString("category1")}, 0),
        mockEntry("test_form", {"test": pString("category1")}, 0),
        mockEntry("test_form", {"test": pString("category2")}, 1000 * 60 * 60 * 24),
    ]);
    const analytics = new AnalyticsService(new DummyFormService(
        [
            mockForm("test_form", {
                "test": FormQuestionDataType.TEXT
            })
        ],
    ), journal);

    let [values] = await analytics.fetchRawValues(SimpleTimeScopeType.DAILY, 7);
    expect(values).toEqual(new Map([
        ["test_form", new Map([
            ["test", {
                values: new Map([[
                    "category1", new Map([[0, 2]])
                ], [
                    "category2", new Map([[1000 * 60 * 60 * 24, 1]])
                ]]), quantitative: false
            }]
        ])]
    ]));
})
