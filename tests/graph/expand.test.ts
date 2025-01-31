import {expect, test} from "vitest";
import {DummyFormService, DummyIndexCollection, DummyJournalCollection} from "../dummy-collections";
import {pDisplay, pNumber, pString} from "../../src/model/primitive/primitive";
import {VariableGraph} from "../../src/services/variable/graph";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {ExpandedVariable, expandVariable, Variable, VariableTypeName} from "../../src/model/variable/variable";
import {ExpandedListVariableType, ListVariableType} from "../../src/services/variable/types/list";
import {Form, FormQuestionDataType, FormQuestionDisplayType} from "../../src/model/form/form";
import {
    AggregateType,
    AggregateVariableType,
    ExpandedAggregateVariableType
} from "../../src/services/variable/types/aggregate";
import {
    ComparisonGoalCondition,
    ComparisonOperator, ExpandedComparisonGoalCondition, ExpandedGoalVariableType,
    GoalConditionType,
    GoalVariableType
} from "../../src/services/variable/types/goal";

test("expand list variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            {
                id: "entry_one",
                formId: "ok",
                name: "",
                icon: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(10.0), pString("10.0"))
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                name: "",
                icon: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0"))
                }
            }
        ]
    );

    let form: Form = {
        id: "ok",
        name: "ok",
        icon: "",
        snapshotId: "",
        questions: [
            {
                id: "ok",
                name: "ok",
                displayType: FormQuestionDisplayType.INPUT,
                displaySettings: {},
                dataType: FormQuestionDataType.NUMBER,
                dataSettings: {
                    min: null,
                    max: null,
                }
            }
        ]
    }

    const formService = new DummyFormService([form]);
    const graph = new VariableGraph(index, journal, WeekStart.MONDAY);
    let variable: Variable = {
        id: "test",
        name: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true})
        }
    }
    graph.onVariableCreated(variable);

    let expanded = await expandVariable(variable, graph, formService);
    expect(expanded).toEqual({
        id: "test",
        name: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ExpandedListVariableType(form, {ok: true})
        }
    });
})

test("expand aggregate variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            {
                id: "entry_one",
                formId: "ok",
                name: "",
                icon: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(10.0), pString("10.0"))
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                name: "",
                icon: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0"))
                }
            }
        ]
    );

    let form: Form = {
        id: "ok",
        name: "ok",
        icon: "",
        snapshotId: "",
        questions: [
            {
                id: "ok",
                name: "ok",
                displayType: FormQuestionDisplayType.INPUT,
                displaySettings: {},
                dataType: FormQuestionDataType.NUMBER,
                dataSettings: {
                    min: null,
                    max: null,
                }
            }
        ]
    }

    const formService = new DummyFormService([form]);
    const graph = new VariableGraph(index, journal, WeekStart.MONDAY);
    graph.onVariableCreated({
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true})
        }
    });
    let aggregate: Variable = {
        id: "aggregate",
        name: "test",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.SUM, "test", "ok")
        }
    }
    graph.onVariableCreated(aggregate);

    let expanded = await expandVariable(aggregate, graph, formService);
    expect(expanded).toEqual({
        id: "aggregate",
        type: {
            type: VariableTypeName.AGGREGATE, value: new ExpandedAggregateVariableType(AggregateType.SUM, {
                id: "test",
                type: {
                    type: VariableTypeName.LIST,
                    value: new ExpandedListVariableType(form, {ok: true})
                }
            }, "ok")
        }
    });
});

test("expand goal variable", async () => {
    const index = new DummyIndexCollection();
    const journal = new DummyJournalCollection(
        [
            {
                id: "entry_one",
                formId: "ok",
                name: "",
                icon: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(10.0), pString("10.0"))
                }
            },
            {
                id: "entry_two",
                formId: "ok",
                name: "",
                icon: "",
                snapshotId: "",
                timestamp: 0,
                answers: {
                    "ok": pDisplay(pNumber(13.0), pString("13.0"))
                }
            }
        ]
    );

    let form: Form = {
        id: "ok",
        name: "ok",
        icon: "",
        snapshotId: "",
        questions: [
            {
                id: "ok",
                name: "ok",
                displayType: FormQuestionDisplayType.INPUT,
                displaySettings: {},
                dataType: FormQuestionDataType.NUMBER,
                dataSettings: {
                    min: null,
                    max: null,
                }
            }
        ]
    }

    const formService = new DummyFormService([form]);
    const graph = new VariableGraph(index, journal, WeekStart.MONDAY);
    graph.onVariableCreated({
        id: "test",
        type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("ok", {ok: true})
        }
    });
    graph.onVariableCreated({
        id: "aggregate",
        type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(AggregateType.SUM, "test", "ok")
        }
    });

    let goal: Variable = {
        id: "goal",
        name: "test",
        type: {
            type: VariableTypeName.GOAL,
            value: new GoalVariableType([
                {
                    id: "condition1",
                    type: GoalConditionType.COMPARISON,
                    value: new ComparisonGoalCondition(
                        {constant: false, value: pString("aggregate")},
                        ComparisonOperator.EQUAL,
                        {constant: true, value: pNumber(23.0)}
                    )
                },
            ], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
        }
    }

    let expanded = await expandVariable(goal, graph, formService);
    expect(expanded).toEqual({
        id: "goal",
        type: {
            type: VariableTypeName.GOAL,
            value: new ExpandedGoalVariableType([
                {
                    id: "condition1",
                    type: GoalConditionType.COMPARISON,
                    value: new ExpandedComparisonGoalCondition(
                        {
                            constant: false, value: {
                                id: "aggregate",
                                type: {
                                    type: VariableTypeName.AGGREGATE,
                                    value: new ExpandedAggregateVariableType(AggregateType.SUM, {
                                        id: "test",
                                        type: {
                                            type: VariableTypeName.LIST,
                                            value: new ExpandedListVariableType(form, {ok: true})
                                        }
                                    }, "ok")
                                }
                            }
                        },
                        ComparisonOperator.EQUAL,
                        {constant: true, value: pNumber(23.0)}
                    )
                },
            ], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
        }
    });
});
