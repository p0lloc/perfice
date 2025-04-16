import {expect, test} from "vitest";
import {DummyIndexCollection, DummyJournalCollection, DummyTagEntryCollection} from "../dummy-collections";
import {EntryAction, VariableGraph} from "../../src/services/variable/graph";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {Variable, VariableTypeName} from "../../src/model/variable/variable";
import {pJournalEntry, pList, pMap, pNumber, pString} from "../../src/model/primitive/primitive";
import {GroupVariableType} from "../../src/services/variable/types/group";
import {mockEntry} from "../common";
import {JournalEntry} from "../../src/model/journal/journal";
import {FilterComparisonOperator} from "../../src/services/variable/filtering";
import {AggregateType, AggregateVariableType} from "../../src/services/variable/types/aggregate";

test("empty group variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection();
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);

    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.GROUP,
            value: new GroupVariableType("ok", {ok: true}, "", [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pMap({}));
});


test("simple single group variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0), "bro": pString("test")}),
            mockEntry("entry_two", "ok", {"ok": pNumber(13.0), "bro": pString("test")}),
            mockEntry("entry_three", "ok", {"ok": pNumber(10.0), "bro": pString("ok")}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.GROUP,
            value: new GroupVariableType("ok", {ok: false}, "bro", [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pMap({
            "test": pList([pJournalEntry("entry_one", 0,
                {
                    "ok":
                        pNumber(10.0)
                }
            ),
                pJournalEntry("entry_two", 0,
                    {
                        "ok":
                            pNumber(13.0)
                    }
                )
            ]),
            "ok": pList([
                pJournalEntry("entry_three", 0, {"ok": pNumber(10.0)})
            ])
        }));
})


test("sum aggregated group variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0), "bro": pString("test")}),
            mockEntry("entry_two", "ok", {"ok": pNumber(13.0), "bro": pString("test")}),
            mockEntry("entry_three", "ok", {"ok": pNumber(10.0), "bro": pString("ok")}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.GROUP,
            value: new GroupVariableType("ok", {ok: false}, "bro", [])
        }
    }
    graph.onVariableCreated(variable);

    let aggregateVariable: Variable = {
        name: "aggregate",
        id: "aggregate",
        type: {
            type: VariableTypeName.GROUP,
            value: new AggregateVariableType(AggregateType.SUM, "test", "ok")
        }
    }
    graph.onVariableCreated(aggregateVariable);

    let val = await graph.evaluateVariable(aggregateVariable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pMap({
            "test": pNumber(23.0),
            "ok": pNumber(10.0),
        }));
})


test("mean aggregated group variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0), "bro": pString("test")}),
            mockEntry("entry_two", "ok", {"ok": pNumber(30.0), "bro": pString("test")}),
            mockEntry("entry_three", "ok", {"ok": pNumber(10.0), "bro": pString("ok")}),
            mockEntry("entry_four", "ok", {"ok": pNumber(90.0), "bro": pString("ok")}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.GROUP,
            value: new GroupVariableType("ok", {ok: false}, "bro", [])
        }
    }
    graph.onVariableCreated(variable);

    let aggregateVariable: Variable = {
        name: "aggregate",
        id: "aggregate",
        type: {
            type: VariableTypeName.GROUP,
            value: new AggregateVariableType(AggregateType.MEAN, "test", "ok")
        }
    }
    graph.onVariableCreated(aggregateVariable);

    let val = await graph.evaluateVariable(aggregateVariable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pMap({
            "test": pNumber(20.0),
            "ok": pNumber(50.0),
        }));
})

test("group variable new entry", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0), "bro": pString("test")}),
            mockEntry("entry_two", "ok", {"ok": pNumber(13.0), "bro": pString("test")}),
            mockEntry("entry_three", "ok", {"ok": pNumber(10.0), "bro": pString("ok")}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.GROUP,
            value: new GroupVariableType("ok", {ok: false}, "bro", [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pMap({
            "test": pList([pJournalEntry("entry_one", 0,
                {
                    "ok":
                        pNumber(10.0)
                }
            ),
                pJournalEntry("entry_two", 0,
                    {
                        "ok":
                            pNumber(13.0)
                    }
                )
            ]),
            "ok": pList([
                pJournalEntry("entry_three", 0, {"ok": pNumber(10.0)})
            ])
        }));

    let entryTwo: JournalEntry = mockEntry("entry_four", "ok", {"ok": pNumber(13.0), "bro": pString("test")});

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);
    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(
        pMap({
            "test": pList([pJournalEntry("entry_one", 0,
                {
                    "ok":
                        pNumber(10.0)
                }
            ),
                pJournalEntry("entry_two", 0,
                    {
                        "ok":
                            pNumber(13.0)
                    }
                ),

                pJournalEntry("entry_four", 0,
                    {
                        "ok":
                            pNumber(13.0)
                    }
                )
            ]),
            "ok": pList([
                pJournalEntry("entry_three", 0, {"ok": pNumber(10.0)})
            ])
        })
    );
})

test("group variable new entry, new group", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0), "bro": pString("test")}),
            mockEntry("entry_two", "ok", {"ok": pNumber(13.0), "bro": pString("test")}),
            mockEntry("entry_three", "ok", {"ok": pNumber(10.0), "bro": pString("ok")}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.GROUP,
            value: new GroupVariableType("ok", {ok: false}, "bro", [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pMap({
            "test": pList([pJournalEntry("entry_one", 0,
                {
                    "ok":
                        pNumber(10.0)
                }
            ),
                pJournalEntry("entry_two", 0,
                    {
                        "ok":
                            pNumber(13.0)
                    }
                )
            ]),
            "ok": pList([
                pJournalEntry("entry_three", 0, {"ok": pNumber(10.0)})
            ])
        }));

    let entryTwo: JournalEntry = mockEntry("entry_four", "ok", {"ok": pNumber(13.0), "bro": pString("new-group")});

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);
    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(
        pMap({
            "test": pList([pJournalEntry("entry_one", 0,
                {
                    "ok":
                        pNumber(10.0)
                }
            ),
                pJournalEntry("entry_two", 0,
                    {
                        "ok":
                            pNumber(13.0)
                    }
                ),
            ]),
            "ok": pList([
                pJournalEntry("entry_three", 0, {"ok": pNumber(10.0)})
            ]),
            "new-group": pList([
                pJournalEntry("entry_four", 0,
                    {
                        "ok":
                            pNumber(13.0)
                    }
                )
            ])
        })
    );
});


test("group variable new entry, move group", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0), "bro": pString("test")}),
            mockEntry("entry_two", "ok", {"ok": pNumber(13.0), "bro": pString("test")}),
            mockEntry("entry_three", "ok", {"ok": pNumber(10.0), "bro": pString("ok")}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.GROUP,
            value: new GroupVariableType("ok", {ok: false}, "bro", [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pMap({
            "test": pList([pJournalEntry("entry_one", 0,
                {
                    "ok":
                        pNumber(10.0)
                }
            ),
                pJournalEntry("entry_two", 0,
                    {
                        "ok":
                            pNumber(13.0)
                    }
                )
            ]),
            "ok": pList([
                pJournalEntry("entry_three", 0, {"ok": pNumber(10.0)})
            ])
        }));

    let entryTwo: JournalEntry = mockEntry("entry_two", "ok", {"ok": pNumber(13.0), "bro": pString("ok")});

    await journal.updateEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.UPDATED);
    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(
        pMap({
            "ok": pList([
                pJournalEntry("entry_two", 0, {"ok": pNumber(13.0)}),
                pJournalEntry("entry_three", 0, {"ok": pNumber(10.0)}),
            ]),
            "test": pList([
                pJournalEntry("entry_one", 0, {"ok": pNumber(10.0)}),
            ])
        })
    );
})

test("group variable new entry, filtered out", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0), "bro": pString("test")}),
            mockEntry("entry_two", "ok", {"ok": pNumber(13.0), "bro": pString("test")}),
            mockEntry("entry_three", "ok", {"ok": pNumber(10.0), "bro": pString("ok")}),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.GROUP,
            value: new GroupVariableType("ok", {ok: false}, "bro", [
                {
                    id: "",
                    field: "ok",
                    operator: FilterComparisonOperator.GREATER_THAN_EQUAL,
                    value: pNumber(10.0)
                }
            ])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pMap({
            "test": pList([pJournalEntry("entry_one", 0,
                {
                    "ok":
                        pNumber(10.0)
                }
            ),
                pJournalEntry("entry_two", 0,
                    {
                        "ok":
                            pNumber(13.0)
                    }
                )
            ]),
            "ok": pList([
                pJournalEntry("entry_three", 0, {"ok": pNumber(10.0)})
            ])
        }));

    let entryTwo: JournalEntry = mockEntry("entry_two", "ok", {"ok": pNumber(9.0), "bro": pString("ok")});

    await journal.updateEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.UPDATED);
    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(
        pMap({
            "ok": pList([
                pJournalEntry("entry_three", 0, {"ok": pNumber(10.0)}),
            ]),
            "test": pList([
                pJournalEntry("entry_one", 0, {"ok": pNumber(10.0)}),
            ])
        })
    );
})
