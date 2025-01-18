import {DummyIndexCollection, DummyJournalCollection} from "./dummy-collections";
import {VariableGraph} from "../src/services/variable/graph";
import {expect, test} from "vitest";
import {Variable, VariableTypeName} from "../src/model/variable/variable";
import {ListVariableType} from "../src/services/variable/types/list";
import {SimpleTimeScope, SimpleTimeScopeType, TimeScopeType, tSimple, WeekStart} from "../src/model/variable/time/time";
import {pDisplay, pEntry, pList, pMap, pNumber, pString} from "../src/model/primitive/primitive";
import {AggregateType, AggregateVariableType} from "../src/services/variable/types/aggregate";


test("empty list variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection();
    const graph = new VariableGraph(index, journal);

    let variable: Variable = {
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true})
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
            {
                id: "entry_one",
                formId: "ok",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(10.0), pString("10.0"))
                }
            }
        ]
    );
    const graph = new VariableGraph(index, journal);
    let variable: Variable = {
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: false})
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pEntry("entry_one", 0, {"ok": pNumber(10.0)})
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
                answers: {
                    "ok": pDisplay(pNumber(10.0), pString("10.0"))
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0"))
                }
            }
        ]
    );
    const graph = new VariableGraph(index, journal);
    let variable: Variable = {
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true})
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pEntry("entry_one", 0, {"ok": pDisplay(pNumber(10.0), pString("10.0"))}),
        pEntry("entry_two", 0, {"ok": pDisplay(pNumber(13.0), pString("13.0"))})
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
                answers: {
                    "one": pDisplay(pNumber(10.0), pString("10.0")),
                    "two": pDisplay(pNumber(10.0), pString("10.0"))
                }
            },
        ]
    );
    const graph = new VariableGraph(index, journal);
    let variable: Variable = {
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {one: true, two: false})
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    // We are getting display value of first question, but raw value of second.
    expect(val).toEqual(pList([
        pEntry("entry_one", 0, {"one": pDisplay(pNumber(10.0), pString("10.0")), "two": pNumber(10.0)}),
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
                answers: {
                    "ok": pDisplay(pNumber(10.0), pString("10.0"))
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0"))
                }
            }
        ]
    );
    const graph = new VariableGraph(index, journal);
    graph.onVariableCreated({
        id: "list_variable",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true})
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
                timestamp: 0,
                answers: {
                    "ok": pNumber(60.0)
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                timestamp: 0,
                answers: {
                    "ok": pNumber(40.0)
                }
            }
        ]
    );
    const graph = new VariableGraph(index, journal);
    graph.onVariableCreated({
        id: "list_variable",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true})
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
