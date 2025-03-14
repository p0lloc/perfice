import {DummyIndexCollection, DummyJournalCollection, DummyTagEntryCollection} from "../dummy-collections";
import {EntryAction, VariableGraph} from "../../src/services/variable/graph";
import {expect, test} from "vitest";
import {Variable, VariableTypeName} from "../../src/model/variable/variable";
import {ListVariableType} from "../../src/services/variable/types/list";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {pDisplay, pJournalEntry, pList, pNumber, pString} from "../../src/model/primitive/primitive";
import {AggregateType, AggregateVariableType} from "../../src/services/variable/types/aggregate";
import {JournalEntry} from "../../src/model/journal/journal";
import {CalculationOperator, CalculationVariableType} from "../../src/services/variable/types/calculation";
import {mockEntry} from "../common";

test("empty list variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection();
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);

    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([]));
});

test("simple single list variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: false}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pJournalEntry("entry_one", 0, {"ok": pNumber(10.0)})
    ]));
})

test("simple multiple list variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            {
                id: "entry_one",
                formId: "ok",
                timestamp: 0,
                snapshotId: "",
                displayValue: "",
                answers: {
                    "ok": pDisplay(pNumber(10.0), pString("10.0"))
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0"))
                }
            }
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pJournalEntry("entry_one", 0, {"ok": pDisplay(pNumber(10.0), pString("10.0"))}),
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));
})

test("simple multiple fields list variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            {
                id: "entry_one",
                formId: "ok",
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "one": pDisplay(pNumber(10.0), pString("10.0")),
                    "two": pDisplay(pNumber(10.0), pString("10.0"))
                }
            },
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {one: true, two: false}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    // We are getting display value of first question, but raw value of second.
    expect(val).toEqual(pList([
        pJournalEntry("entry_one", 0, {"one": pDisplay(pNumber(10.0), pString("10.0")), "two": pNumber(10.0)}),
    ]));
})

test("simple aggregate sum variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            {
                id: "entry_one",
                formId: "ok",
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "ok": pDisplay(pNumber(10.0), pString("10.0"))
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                displayValue: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0"))
                }
            }
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    graph.onVariableCreated({
        id: "list_variable",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true}, [])
        }
    });
    graph.onVariableCreated({
        id: "aggregate_variable",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.SUM, "list_variable", "ok"),
        }
    });
    let val = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(23.0));
})

test("simple aggregate mean variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            {
                id: "entry_one",
                formId: "ok",
                displayValue: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pNumber(60.0)
                }
            },
            {
                displayValue: "",
                snapshotId: "",
                id: "entry_two",
                formId: "ok",
                timestamp: 0,
                answers: {
                    "ok": pNumber(40.0)
                }
            }
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    graph.onVariableCreated({
        id: "list_variable",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true}, [])
        }
    });
    graph.onVariableCreated({
        id: "aggregate_variable",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.MEAN, "list_variable", "ok"),
        }
    });
    let val = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(50.0));
})


test("simple single list variable new entry", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            {
                id: "entry_one",
                formId: "ok",
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "ok": pDisplay(pNumber(10.0), pString("10.0"))
                }
            }
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: false}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pJournalEntry("entry_one", 0, {"ok": pNumber(10.0)})
    ]));

    let entryTwo: JournalEntry = mockEntry("entry_two", "ok", {"ok": pNumber(13.0)});

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);

    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(pList([
        pJournalEntry("entry_one", 0, {"ok": pNumber(10.0)}),
        pJournalEntry("entry_two", 0, {"ok": pNumber(13.0)})
    ]));
})

function basicListAndAggregate(): { graph: VariableGraph, journal: DummyJournalCollection } {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}),
            mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    graph.onVariableCreated({
        id: "list_variable",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true}, [])
        }
    });
    graph.onVariableCreated({
        id: "aggregate_variable",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.SUM, "list_variable", "ok"),
        }
    });

    return {graph, journal};
}

test("simple aggregate sum new entry", async () => {
    let {graph, journal} = basicListAndAggregate();
    let val = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(23.0));

    let entryTwo: JournalEntry = mockEntry("entry_two", "ok", {"ok": pNumber(13.0)});

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);

    let val2 = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(pNumber(36.0));
})

// Calculates the average of 30+20, then adds a new entry of 43
// The result of the average should be 93/3 = 31
test("simple aggregate mean new entry", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(30.0)}),
            mockEntry("entry_two", "ok", {"ok": pNumber(20.0)}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    graph.onVariableCreated({
        id: "list_variable",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true}, [])
        }
    });
    graph.onVariableCreated({
        id: "aggregate_variable",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.MEAN, "list_variable", "ok"),
        }
    });
    let val = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(25.0));

    let entryTwo: JournalEntry = mockEntry("entry_two", "ok", {"ok": pNumber(43.0)});

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);

    let val2 = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(pNumber(31.0));
})

test("static calculation variable", async () => {
    const {graph} = basicListAndAggregate();
    graph.onVariableCreated({
        id: "calculation_variable",
        type: {
            type: VariableTypeName.CALCULATION,
            value: new CalculationVariableType([
                {constant: false, value: pString("aggregate_variable")},
                CalculationOperator.PLUS,
                {constant: true, value: pNumber(10.0)}
            ]),
        }
    });
    let val = await graph.evaluateVariable(graph.getVariableById("calculation_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(33.0));

})

test("calculation variable between two dynamic variables", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            {
                id: "entry_one",
                formId: "income",
                displayValue: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(1500.0), pString("1500.0"))
                }
            },
            {
                id: "entry_two",
                formId: "expense",
                displayValue: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(1000.0), pString("1000.0"))
                }
            }
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    graph.onVariableCreated({
        id: "expense_list",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("expense", {ok: true}, [])
        }
    });
    graph.onVariableCreated({
        id: "income_list",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("income", {ok: true}, [])
        }
    });
    graph.onVariableCreated({
        id: "total_expense",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.SUM, "expense_list", "ok"),
        }
    });
    graph.onVariableCreated({
        id: "total_income",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.SUM, "income_list", "ok"),
        }
    });

    graph.onVariableCreated({
        id: "calculation_variable",
        type: {
            type: VariableTypeName.CALCULATION,
            value: new CalculationVariableType([
                {constant: false, value: pString("total_income")},
                CalculationOperator.MINUS,
                {constant: false, value: pString("total_expense")},
            ]),
        }
    });
    let val = await graph.evaluateVariable(graph.getVariableById("calculation_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(500.0));


    let entryTwo: JournalEntry = {
        id: "entry_two",
        formId: "income",
        timestamp: 0,
        displayValue: "",
        snapshotId: "",
        answers: {
            "ok": pDisplay(pNumber(500.0), pString("13.0"))
        }
    };

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);


    let val2 = await graph.evaluateVariable(graph.getVariableById("calculation_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(pNumber(1000.0));

})
