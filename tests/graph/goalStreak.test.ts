import {expect, test} from "vitest";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {pNumber, pString} from "../../src/model/primitive/primitive";
import {
    ComparisonGoalCondition,
    ComparisonOperator,
    GoalConditionType,
    GoalVariableType
} from "../../src/services/variable/types/goal";
import {VariableTypeName} from "../../src/model/variable/variable";
import {VariableGraph} from "../../src/services/variable/graph";
import {DummyIndexCollection, DummyJournalCollection, DummyTagEntryCollection} from "../dummy-collections";
import {mockEntry} from "../common";
import {ListVariableType} from "../../src/services/variable/types/list";
import {AggregateType, AggregateVariableType} from "../../src/services/variable/types/aggregate";
import {createDefaultWeekDays, GoalStreakVariableType} from "../../src/services/variable/types/goalStreak";
import {JournalEntry} from "../../src/model/journal/journal";

function basicListAndAggregate(entries: JournalEntry[]): { graph: VariableGraph } {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        entries
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

test("simple goal streak", async () => {
    let {graph} = basicListAndAggregate([
        mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}),
        mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}),

        mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, Date.now() - 1000 * 60 * 60 * 24),
        mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}, Date.now() - 1000 * 60 * 60 * 24),

        mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, Date.now() - 1000 * 60 * 60 * 24 * 2),
        mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}, Date.now() - 1000 * 60 * 60 * 24 * 2),
    ]);

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

    graph.onVariableCreated({
        id: "goal_streak_variable",
        type: {
            type: VariableTypeName.GOAL_STREAK,
            value: new GoalStreakVariableType("goal_variable", createDefaultWeekDays())
        }
    })

    let streak_result = await graph.evaluateVariable(graph.getVariableById("goal_streak_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(streak_result).toEqual(pNumber(2.0));
})

test("simple goal streak with gap", async () => {
    let {graph} = basicListAndAggregate([
        mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, Date.now() - 1000 * 60 * 60 * 24),
        mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}, Date.now() - 1000 * 60 * 60 * 24),

        mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, Date.now() - 1000 * 60 * 60 * 24 * 3),
        mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}, Date.now() - 1000 * 60 * 60 * 24 * 3),

        mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, Date.now() - 1000 * 60 * 60 * 24 * 4),
        mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}, Date.now() - 1000 * 60 * 60 * 24 * 4),
    ]);

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

    graph.onVariableCreated({
        id: "goal_streak_variable",
        type: {
            type: VariableTypeName.GOAL_STREAK,
            value: new GoalStreakVariableType("goal_variable", createDefaultWeekDays())
        }
    })

    let streak_result = await graph.evaluateVariable(graph.getVariableById("goal_streak_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(streak_result).toEqual(pNumber(1.0));
})

test("simple goal streak with off days", async () => {
    let now = new Date();
    let {graph} = basicListAndAggregate([
        mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, now.getTime() - 1000 * 60 * 60 * 24),
        mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}, now.getTime() - 1000 * 60 * 60 * 24),

        mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, now.getTime() - 1000 * 60 * 60 * 24 * 3),
        mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}, now.getTime() - 1000 * 60 * 60 * 24 * 3),

        mockEntry("entry_one", "ok", {"ok": pNumber(10.0)}, now.getTime() - 1000 * 60 * 60 * 24 * 5),
        mockEntry("entry_two", "ok", {"ok": pNumber(13.0)}, now.getTime() - 1000 * 60 * 60 * 24 * 5),
    ]);

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

    let currentWeekDay = now.getDay();
    let weekDays: number[] = [
        (currentWeekDay - 1) % 7,
        (currentWeekDay - 3) % 7,
        (currentWeekDay - 5) % 7,
    ];

    graph.onVariableCreated({
        id: "goal_streak_variable",
        type: {
            type: VariableTypeName.GOAL_STREAK,
            value: new GoalStreakVariableType("goal_variable", weekDays)
        }
    })


    let streak_result = await graph.evaluateVariable(graph.getVariableById("goal_streak_variable")!,
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(streak_result).toEqual(pNumber(3.0));
})
