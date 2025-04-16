import {expect, test} from "vitest";
import {DummyIndexCollection, DummyJournalCollection, DummyTagEntryCollection} from "../dummy-collections";
import {VariableGraph} from "../../src/services/variable/graph";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {Variable, VariableTypeName} from "../../src/model/variable/variable";
import {pJournalEntry, pList, pMap, pNumber, pString} from "../../src/model/primitive/primitive";
import {GroupVariableType} from "../../src/services/variable/types/group";
import {mockEntry} from "../common";

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
