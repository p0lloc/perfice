import {expect, test} from "vitest";
import {DummyIndexCollection, DummyJournalCollection, DummyTagEntryCollection} from "../dummy-collections";
import {EntryAction, VariableGraph} from "../../src/services/variable/graph";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {Variable, VariableTypeName} from "../../src/model/variable/variable";
import {pJournalEntry, pList, pNull, pNumber} from "../../src/model/primitive/primitive";
import {LatestVariableType} from "../../src/services/variable/types/latest";
import {mockEntry} from "../common";
import {ListVariableType} from "../../src/services/variable/types/list";
import {JournalEntry} from "../../src/model/journal/journal";

test("empty latest variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection();
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);

    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LATEST,
            value: new LatestVariableType("ok", {ok: true}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNull());
});

test("simple single latest variable", async () => {
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
            type: VariableTypeName.LATEST,
            value: new LatestVariableType("ok", {ok: false}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pJournalEntry("entry_one", 0, {"ok": pNumber(10.0)})
    );
})

test("simple ordered latest variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("newer_entry", "ok", {"ok": pNumber(13.0)}, 100),
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, 0),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LATEST,
            value: new LatestVariableType("ok", {ok: false}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pJournalEntry("newer_entry", 100, {"ok": pNumber(13.0)})
    );
})


test("simple ordered latest variable, newer entry", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("newer_entry", "ok", {"ok": pNumber(13.0)}, 100),
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, 0),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LATEST,
            value: new LatestVariableType("ok", {ok: false}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pJournalEntry("newer_entry", 100, {"ok": pNumber(13.0)})
    );


    let entryTwo: JournalEntry = mockEntry("newest_entry", "ok", {"ok": pNumber(13.0)}, 200);

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);
    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(
        pJournalEntry("newest_entry", 200, {"ok": pNumber(13.0)})
    );
})

test("simple ordered latest variable, add not newer entry", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("newer_entry", "ok", {"ok": pNumber(13.0)}, 100),
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, 0),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LATEST,
            value: new LatestVariableType("ok", {ok: false}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pJournalEntry("newer_entry", 100, {"ok": pNumber(13.0)})
    );

    let entryTwo: JournalEntry = mockEntry("new_entry", "ok", {"ok": pNumber(13.0)}, 50);

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);
    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(
        pJournalEntry("newer_entry", 100, {"ok": pNumber(13.0)})
    );
})


test("simple ordered latest variable, delete entry", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("newer_entry", "ok", {"ok": pNumber(13.0)}, 100),
            mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, 0),
        ]
    );
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY);
    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.LATEST,
            value: new LatestVariableType("ok", {ok: false}, [])
        }
    }
    graph.onVariableCreated(variable);
    let val = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(
        pJournalEntry("newer_entry", 100, {"ok": pNumber(13.0)})
    );

    let entry = await journal.getEntryById("newer_entry")
    if(entry == null) throw new Error("base entry not found");
    await journal.deleteEntryById(entry.id);
    await graph.onJournalEntryAction(entry, EntryAction.DELETED);

    let val2 = await graph.evaluateVariable(variable,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val2).toEqual(
        pJournalEntry("entry_one", 0, {"ok": pNumber(10.0)})
    );
})
