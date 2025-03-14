import {DummyIndexCollection, DummyJournalCollection, DummyTagEntryCollection} from "../dummy-collections";
import {EntryAction, VariableGraph} from "../../src/services/variable/graph";
import {expect, test} from "vitest";
import {Variable, VariableTypeName} from "../../src/model/variable/variable";
import {ListVariableType} from "../../src/services/variable/types/list";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {pDisplay, pJournalEntry, pList, pNumber, pString} from "../../src/model/primitive/primitive";
import {mockEntry} from "../common";
import {JournalEntry} from "../../src/model/journal/journal";
import {FilterComparisonOperator} from "../../src/services/variable/filtering";

// Returns all entries with field > 10
test("simple list variable with filter", async () => {
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
                timestamp: 0,
                snapshotId: "",
                displayValue: "",
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
            value: new ListVariableType("ok", {ok: true}, [
                {
                    id: crypto.randomUUID(),
                    field: "ok",
                    operator: FilterComparisonOperator.GREATER_THAN,
                    value: pNumber(10.0)
                }
            ])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));
})


// Returns all entries that have an alcoholic beverage
test("simple list variable with list filter", async () => {
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
                    "ok": pDisplay(pNumber(10.0), pString("10.0")),
                    "beverage_type": pDisplay(pString("beer"), pString("Beer"))
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0")),
                    "beverage_type": pDisplay(pString("wine"), pString("Wine"))
                }
            },
            {
                id: "entry_three",
                formId: "ok",
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0")),
                    "beverage_type": pDisplay(pString("water"), pString("Water"))
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
            value: new ListVariableType("ok", {ok: true}, [
                {
                    id: crypto.randomUUID(),
                    field: "beverage_type",
                    operator: FilterComparisonOperator.IN,
                    value: pList([pString("beer"), pString("wine")])
                }
            ])
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


test("filtered list variable new entry", async () => {
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
                    "ok": pDisplay(pNumber(10.0), pString("10.0")),
                    "beverage_type": pDisplay(pString("beer"), pString("Beer"))
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0")),
                    "beverage_type": pDisplay(pString("wine"), pString("Wine"))
                }
            },
            {
                id: "entry_three",
                formId: "ok",
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0")),
                    "beverage_type": pDisplay(pString("water"), pString("Water"))
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
            value: new ListVariableType("ok", {ok: true}, [
                {
                    id: crypto.randomUUID(),
                    field: "beverage_type",
                    operator: FilterComparisonOperator.IN,
                    value: pList([pString("beer"), pString("wine")])
                }
            ])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pJournalEntry("entry_one", 0, {"ok": pDisplay(pNumber(10.0), pString("10.0"))}),
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));

    // Adding an entry with incorrect "beverage_type" should not affect the list
    let newEntry: JournalEntry = mockEntry("entry_four", "ok", {"ok": pNumber(10.0)});
    await journal.createEntry(newEntry);
    await graph.onJournalEntryAction(newEntry, EntryAction.CREATED);

    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(pList([
        pJournalEntry("entry_one", 0, {"ok": pDisplay(pNumber(10.0), pString("10.0"))}),
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));


    // Adding an entry with correct "beverage_type" should include it
    let newEntry2: JournalEntry = mockEntry("entry_five", "ok", {
        "ok": pNumber(50.0),
        "beverage_type": pString("beer")
    });
    await journal.createEntry(newEntry2);
    await graph.onJournalEntryAction(newEntry2, EntryAction.CREATED);

    let val3 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val3).toEqual(pList([
        pJournalEntry("entry_one", 0, {"ok": pDisplay(pNumber(10.0), pString("10.0"))}),
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))}),
        pJournalEntry("entry_five", 0, {"ok": pDisplay(pNumber(50.0), pString("50"))})
    ]));
})

// Returns all entries with 10 < field < 20
test("simple list variable with multiple filters", async () => {
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
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0"))
                }
            },

            {
                id: "entry_three",
                formId: "ok",
                timestamp: 0,
                displayValue: "",
                snapshotId: "",
                answers: {
                    "ok": pDisplay(pNumber(20.0), pString("20.0"))
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
            value: new ListVariableType("ok", {ok: true}, [
                {
                    id: crypto.randomUUID(),
                    field: "ok",
                    operator: FilterComparisonOperator.GREATER_THAN,
                    value: pNumber(10.0)
                },
                {
                    id: crypto.randomUUID(),
                    field: "ok",
                    operator: FilterComparisonOperator.LESS_THAN,
                    value: pNumber(20.0)
                }
            ])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));
})


// Returns all entries with field > 10
test("filtered list - update entry to be matching", async () => {
    const index = new DummyIndexCollection();
    let firstEntry =
        {
            id: "entry_one",
            formId: "ok",
            timestamp: 0,
            displayValue: "",
            snapshotId: "",
            answers: {
                "ok": pDisplay(pNumber(10.0), pString("10.0"))
            }
        };
    const journal = new DummyJournalCollection(
        [
            firstEntry,
            {
                id: "entry_two",
                formId: "ok",
                timestamp: 0,
                snapshotId: "",
                displayValue: "",
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
            value: new ListVariableType("ok", {ok: true}, [
                {
                    id: crypto.randomUUID(),
                    field: "ok",
                    operator: FilterComparisonOperator.GREATER_THAN,
                    value: pNumber(10.0)
                }
            ])
        }
    }
    graph.onVariableCreated(variable);

    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));

    // Entry is now > 10 so it should be included
    firstEntry.answers["ok"] = pDisplay(pNumber(11.0), pString("11.0"));
    await journal.updateEntry(firstEntry);
    await graph.onJournalEntryAction(firstEntry, EntryAction.UPDATED);

    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);
    expect(val2).toEqual(pList([
        pJournalEntry("entry_one", 0, {"ok": pDisplay(pNumber(11.0), pString("11.0"))}),
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));
})


// Returns all entries with field > 10
test("filtered list - update entry to be matching", async () => {
    const index = new DummyIndexCollection();
    let firstEntry =
        {
            id: "entry_one",
            formId: "ok",
            timestamp: 0,
            displayValue: "",
            snapshotId: "",
            answers: {
                "ok": pDisplay(pNumber(10.0), pString("10.0"))
            }
        };
    const journal = new DummyJournalCollection(
        [
            firstEntry,
            {
                id: "entry_two",
                formId: "ok",
                timestamp: 0,
                snapshotId: "",
                displayValue: "",
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
            value: new ListVariableType("ok", {ok: true}, [
                {
                    id: crypto.randomUUID(),
                    field: "ok",
                    operator: FilterComparisonOperator.GREATER_THAN,
                    value: pNumber(9.0)
                }
            ])
        }
    }
    graph.onVariableCreated(variable);

    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pJournalEntry("entry_one", 0, {"ok": pDisplay(pNumber(10.0), pString("10.0"))}),
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));

    // Entry is now < 9 so it should be filtered out
    firstEntry.answers["ok"] = pDisplay(pNumber(8.0), pString("8.0"));
    await journal.updateEntry(firstEntry);
    await graph.onJournalEntryAction(firstEntry, EntryAction.UPDATED);

    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);
    expect(val2).toEqual(pList([
        pJournalEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));
})
