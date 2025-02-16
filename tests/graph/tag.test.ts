import {expect, test} from "vitest";
import {DummyIndexCollection, DummyJournalCollection, DummyTagEntryCollection} from "../dummy-collections";
import {EntryAction, VariableGraph} from "../../src/services/variable/graph";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {Variable, VariableTypeName} from "../../src/model/variable/variable";
import {pList, PrimitiveValue, pTagEntry} from "../../src/model/primitive/primitive";
import {TagVariableType} from "../../src/services/variable/types/tag";
import {JournalEntry, TagEntry} from "../../src/model/journal/journal";
import {TagEntryCollection} from "../../src/db/collections";

function setupGraph(entries: JournalEntry[] = [], tagEntryList: TagEntry[] = []): [VariableGraph, TagEntryCollection] {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(entries);
    const tagEntries = new DummyTagEntryCollection(tagEntryList);
    return [new VariableGraph(index, journal, tagEntries, WeekStart.MONDAY), tagEntries];
}

function createAndEvaluate(graph: VariableGraph, variable: Variable): Promise<PrimitiveValue> {
    graph.onVariableCreated(variable);
    return evaluate(graph, variable);
}

function evaluate(graph: VariableGraph, variable: Variable): Promise<PrimitiveValue> {
    return graph.evaluateVariable(variable, tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);
}

test("empty tag variable", async () => {
    const [graph] = setupGraph();

    let val = await createAndEvaluate(graph, {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.TAG,
            value: new TagVariableType("ok")
        }
    });

    expect(val).toEqual(pList([]));
});

test("single tag entry", async () => {
    const [graph] = setupGraph([], [
        {
            id: "entry_one",
            timestamp: 0,
            tagId: "ok"
        }
    ]);

    let val = await createAndEvaluate(graph, {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.TAG,
            value: new TagVariableType("ok")
        }
    });

    expect(val).toEqual(pList([
        pTagEntry("entry_one", 0)
    ]));
});

test("new tag entry", async () => {
    const [graph, tagEntries] = setupGraph([], [
        {
            id: "entry_one",
            timestamp: 0,
            tagId: "ok"
        }
    ]);

    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.TAG,
            value: new TagVariableType("ok")
        }
    };
    let val = await createAndEvaluate(graph, variable);

    expect(val).toEqual(pList([
        pTagEntry("entry_one", 0)
    ]));

    let entryTwo: TagEntry = {
        id: "entry_two",
        timestamp: 0,
        tagId: "ok"
    };

    await tagEntries.createEntry(entryTwo);
    await graph.onTagEntryAction(entryTwo, EntryAction.CREATED);

    let val2 = await evaluate(graph, variable);

    expect(val2).toEqual(pList([
        pTagEntry("entry_one", 0),
        pTagEntry("entry_two", 0)
    ]));
});


test("deleted tag entry", async () => {
    let entryOne =
        {
            id: "entry_one",
            timestamp: 0,
            tagId: "ok"
        }
    const [graph, tagEntries] = setupGraph([], [
        entryOne
    ]);

    let variable: Variable = {
        name: "test",
        id: "test",
        type: {
            type: VariableTypeName.TAG,
            value: new TagVariableType("ok")
        }
    };
    let val = await createAndEvaluate(graph, variable);

    expect(val).toEqual(pList([
        pTagEntry("entry_one", 0)
    ]));

    let entryTwo: TagEntry = {
        id: "entry_two",
        timestamp: 0,
        tagId: "ok"
    };

    await tagEntries.createEntry(entryTwo);
    await graph.onTagEntryAction(entryTwo, EntryAction.CREATED);

    let val2 = await evaluate(graph, variable);

    expect(val2).toEqual(pList([
        pTagEntry("entry_one", 0),
        pTagEntry("entry_two", 0)
    ]));

    await tagEntries.deleteEntryById(entryOne.id);
    await graph.onTagEntryAction(entryOne, EntryAction.DELETED);
    let val3 = await evaluate(graph, variable);
    expect(val3).toEqual(pList([
        pTagEntry("entry_two", 0)
    ]));
})
