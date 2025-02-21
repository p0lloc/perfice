import {expect, test} from "vitest";
import {DummyIndexCollection, DummyJournalCollection, DummyTagEntryCollection} from "../dummy-collections";
import {pComparisonResult, pMap, pNumber, pString} from "../../src/model/primitive/primitive";
import {EntryAction, VariableGraph} from "../../src/services/variable/graph";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {VariableTypeName} from "../../src/model/variable/variable";
import {ListVariableType} from "../../src/services/variable/types/list";
import {AggregateType, AggregateVariableType} from "../../src/services/variable/types/aggregate";
import {
    ComparisonGoalCondition,
    ComparisonOperator,
    GoalConditionType,
    GoalVariableType
} from "../../src/services/variable/types/goal";
import {JournalEntry} from "../../src/model/journal/journal";
import {mockEntry} from "../common";

test("simple goal", async () => {
    let {graph} = basicListAndAggregate();
    let val = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(23.0));

    let comparison: ComparisonGoalCondition = new ComparisonGoalCondition(
        {constant: false, value: pString("aggregate_variable")},
        ComparisonOperator.EQUAL,
        {constant: true, value: pNumber(23.0)}
    );

    graph.onVariableCreated({
        id: "goal_variable",
        type: {
            type: VariableTypeName.GOAL,
            value: new GoalVariableType([
                {
                    id: "condition1",
                    type: GoalConditionType.COMPARISON,
                    value: comparison
                },
            ], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
        }
    });
    let goal_result = await graph.evaluateVariable(graph.getVariableById("goal_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(goal_result).toEqual(pMap({
        "condition1": pComparisonResult(pNumber(23.0), pNumber(23.0), true)
    }));
})


function basicListAndAggregate(): { graph: VariableGraph } {
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

    return {graph};
}


test("multi-condition goal", async () => {
    let {graph} = basicListAndAggregate();
    graph.onVariableCreated({
        id: "mean_variable",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.MEAN, "list_variable", "ok"),
        }
    });
    let val = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(23.0));

    graph.onVariableCreated({
        id: "goal_variable",
        type: {
            type: VariableTypeName.GOAL,
            value: new GoalVariableType([
                {
                    id: "condition1",
                    type: GoalConditionType.COMPARISON,
                    value: new ComparisonGoalCondition(
                        {constant: false, value: pString("aggregate_variable")},
                        ComparisonOperator.EQUAL,
                        {constant: true, value: pNumber(23.0)}
                    )
                },
                {
                    id: "condition2",
                    type: GoalConditionType.COMPARISON,
                    value: new ComparisonGoalCondition(
                        {constant: false, value: pString("mean_variable")},
                        ComparisonOperator.LESS_THAN,
                        {constant: true, value: pNumber(30.0)}
                    )
                },
            ], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
        }
    });
    let goal_result = await graph.evaluateVariable(graph.getVariableById("goal_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(goal_result).toEqual(pMap({
        "condition1": pComparisonResult(pNumber(23.0), pNumber(23.0), true),
        "condition2": pComparisonResult(pNumber(11.5), pNumber(30.0), true)
    }));
})


test("goal with dynamic target", async () => {
    let {graph} = basicListAndAggregate();
    graph.onVariableCreated({
        id: "mean_variable",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.MEAN, "list_variable", "ok"),
        }
    });
    let val = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(23.0));

    graph.onVariableCreated({
        id: "goal_variable",
        type: {
            type: VariableTypeName.GOAL,
            value: new GoalVariableType([
                {
                    id: "condition1",
                    type: GoalConditionType.COMPARISON,
                    value: new ComparisonGoalCondition(
                        {constant: false, value: pString("aggregate_variable")},
                        ComparisonOperator.GREATER_THAN_EQUAL,
                        {constant: false, value: pString("mean_variable")}
                    )
                },
            ], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
        }
    });
    let goal_result = await graph.evaluateVariable(graph.getVariableById("goal_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(goal_result).toEqual(pMap({
        "condition1": pComparisonResult(pNumber(23.0), pNumber(11.5), true),
    }));
})


test("goal with dynamic target and new entry", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            mockEntry("entry_one", "income", {"ok": pNumber(10.0)}),
            mockEntry("entry_two", "expense", {"ok": pNumber(13.0)}),
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
        id: "goal_variable",
        type: {
            type: VariableTypeName.GOAL,
            value: new GoalVariableType([
                {
                    id: "income_greater_than_expense",
                    type: GoalConditionType.COMPARISON,
                    value: new ComparisonGoalCondition(
                        {constant: false, value: pString("total_income")},
                        ComparisonOperator.GREATER_THAN,
                        {constant: false, value: pString("total_expense")}
                    )
                },
            ], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
        }
    });
    let goal_result = await graph.evaluateVariable(graph.getVariableById("goal_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(goal_result).toEqual(pMap({
        "income_greater_than_expense": pComparisonResult(pNumber(10.0), pNumber(13.0), false),
    }));

    let entryTwo = mockEntry("entry_two", "income", {"ok": pNumber(10.0)});

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);
    let goal_result2 = await graph.evaluateVariable(graph.getVariableById("goal_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(goal_result2).toEqual(pMap({
        "income_greater_than_expense": pComparisonResult(pNumber(20.0), pNumber(13.0), true),
    }));
})

test("simple goal with new entry", async () => {
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
    let val = await graph.evaluateVariable(graph.getVariableById("aggregate_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pNumber(23.0));

    let comparison: ComparisonGoalCondition = new ComparisonGoalCondition(
        {constant: false, value: pString("aggregate_variable")},
        ComparisonOperator.GREATER_THAN_EQUAL,
        {constant: true, value: pNumber(30.0)}
    );
    graph.onVariableCreated({
        id: "goal_variable",
        type: {
            type: VariableTypeName.GOAL,
            value: new GoalVariableType([
                {
                    id: "condition1",
                    type: GoalConditionType.COMPARISON,
                    value: comparison
                },
            ], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
        }
    });
    let goal_result = await graph.evaluateVariable(graph.getVariableById("goal_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(goal_result).toEqual(pMap({
        "condition1": pComparisonResult(pNumber(23.0), pNumber(30.0), false)
    }));

    let entryTwo: JournalEntry = mockEntry("entry_two", "ok", {"ok": pNumber(7.0)});

    await journal.createEntry(entryTwo);
    await graph.onJournalEntryAction(entryTwo, EntryAction.CREATED);

    let goal_result2 = await graph.evaluateVariable(graph.getVariableById("goal_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);
    expect(goal_result2).toEqual(pMap({
        "condition1": pComparisonResult(pNumber(30.0), pNumber(30.0), true)
    }));
})
