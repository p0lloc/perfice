import {expect, test} from "vitest";
import {
    DummyFormService,
    DummyIndexCollection,
    DummyJournalCollection, DummyTagEntryCollection,
    DummyTrackableCollection,
    DummyVariableCollection
} from "../dummy-collections";
import {BaseJournalService, JournalEntryObserverType, JournalService} from "../../src/services/journal/journal";
import {VariableGraph} from "../../src/services/variable/graph";
import {SimpleTimeScopeType, tSimple, WeekStart} from "../../src/model/variable/time/time";
import {VariableService} from "../../src/services/variable/variable";
import type {JournalEntry} from "../../src/model/journal/journal";
import {VariableEditProvider} from "../../src/stores/variable/edit";
import {TrackableService} from "../../src/services/trackable/trackable";
import {VariableTypeName} from "../../src/model/variable/variable";
import {EditAggregationVariableState} from "../../src/stores/variable/editState";
import {ListVariableType} from "../../src/services/variable/types/list";
import {Form} from "../../src/model/form/form";
import {
    pComparisonResult,
    pDisplay,
    pJournalEntry,
    pList,
    pMap,
    pNumber,
    pString
} from "../../src/model/primitive/primitive";
import {AggregateVariableType} from "../../src/services/variable/types/aggregate";
import {
    ComparisonGoalCondition,
    ComparisonOperator,
    GoalConditionType,
    GoalVariableType
} from "../../src/services/variable/types/goal";

test("test basic edit + entry created", async () => {
    const indices = new DummyIndexCollection();
    const journal = new DummyJournalCollection([]);
    const variables = new DummyVariableCollection();

    const journalService = new BaseJournalService(journal);
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(indices, journal, tagEntries, WeekStart.MONDAY);

    const variableService = new VariableService(variables, indices, graph);
    journalService.addEntryObserver(JournalEntryObserverType.CREATED, async (e: JournalEntry) => {
        await variableService.onEntryCreated(e);
    });
    journalService.addEntryObserver(JournalEntryObserverType.DELETED, async (e: JournalEntry) => {
        await variableService.onEntryDeleted(e);
    });
    journalService.addEntryObserver(JournalEntryObserverType.UPDATED, async (e: JournalEntry) => {
        await variableService.onEntryUpdated(e);
    });


    const editProvider = new VariableEditProvider(variableService, new DummyFormService(),
        new TrackableService(new DummyTrackableCollection(), variableService, new DummyFormService()));

    editProvider.newEdit();
    let goal = editProvider.createVariableFromType(VariableTypeName.GOAL);
    let aggregateVariable = editProvider.createVariableFromType(VariableTypeName.AGGREGATE);
    let editState: EditAggregationVariableState = await editProvider.getEditState(aggregateVariable);

    if (goal.type.type != VariableTypeName.GOAL || aggregateVariable.type.type != VariableTypeName.AGGREGATE) {
        throw new Error("Wrong types");
    }

    let aggregateData = aggregateVariable.type.value as AggregateVariableType;
    aggregateVariable = {
        ...aggregateVariable, type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(aggregateData.getAggregateType(), editState.listVariable.id, "test")
        }
    }
    editProvider.updateVariable(aggregateVariable);

    editState.listVariable = {
        ...editState.listVariable, type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("testForm", {
                "test": true
            }, editState.listVariableValue.getFilters())
        }
    }
    editProvider.updateVariable(editState.listVariable);

    await editProvider.save();

    let form: Form = {
        id: "testForm",
        name: "",
        icon: "",
        format: [],
        snapshotId: "",
        questions: [],
    };

    let entry = await journalService.logEntry(form,
        {"test": pDisplay(pNumber(13.0), pString("13.0"))}, form.format, 0);
    let val = await graph.evaluateVariable(graph.getVariableById(editState.listVariable.id),
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pList([
        pJournalEntry(entry.id, entry.timestamp, {"test": pDisplay(pNumber(13.0), pString("13.0"))})
    ]));
});

test("goal edit + entry created", async () => {
    const indices = new DummyIndexCollection();
    const journal = new DummyJournalCollection([]);
    const variables = new DummyVariableCollection();

    const journalService = new BaseJournalService(journal);
    const tagEntries = new DummyTagEntryCollection();
    const graph = new VariableGraph(indices, journal, tagEntries, WeekStart.MONDAY);

    const variableService = new VariableService(variables, indices, graph);
    journalService.addEntryObserver(JournalEntryObserverType.CREATED, async (e: JournalEntry) => {
        await variableService.onEntryCreated(e);
    });
    journalService.addEntryObserver(JournalEntryObserverType.DELETED, async (e: JournalEntry) => {
        await variableService.onEntryDeleted(e);
    });
    journalService.addEntryObserver(JournalEntryObserverType.UPDATED, async (e: JournalEntry) => {
        await variableService.onEntryUpdated(e);
    });

    const editProvider = new VariableEditProvider(variableService, new DummyFormService(),
        new TrackableService(new DummyTrackableCollection(), variableService, new DummyFormService()));

    editProvider.newEdit();
    let goal = editProvider.createVariableFromType(VariableTypeName.GOAL);
    let aggregateVariable = editProvider.createVariableFromType(VariableTypeName.AGGREGATE);
    let editState: EditAggregationVariableState = await editProvider.getEditState(aggregateVariable);

    if (goal.type.type != VariableTypeName.GOAL || aggregateVariable.type.type != VariableTypeName.AGGREGATE) {
        throw new Error("Wrong types");
    }

    let aggregateData = aggregateVariable.type.value as AggregateVariableType;
    aggregateVariable = {
        ...aggregateVariable, type: {
            type: VariableTypeName.AGGREGATE,
            value: new AggregateVariableType(aggregateData.getAggregateType(), editState.listVariable.id, "test")
        }
    }
    editProvider.updateVariable(aggregateVariable);

    editState.listVariable = {
        ...editState.listVariable, type: {
            type: VariableTypeName.LIST,
            value: new ListVariableType("testForm", {
                "test": true
            }, editState.listVariableValue.getFilters())
        }
    }
    editProvider.updateVariable(editState.listVariable);
    goal = {
        ...goal,
        type: {
            type: VariableTypeName.GOAL,
            value: new GoalVariableType([
                {
                    id: "condition1",
                    type: GoalConditionType.COMPARISON,
                    value: new ComparisonGoalCondition(
                        {constant: false, value: pString(aggregateVariable.id)},
                        ComparisonOperator.GREATER_THAN_EQUAL,
                        {constant: true, value: pNumber(30.0)}
                    )
                }
            ], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
        }
    }
    editProvider.updateVariable(goal);

    await editProvider.save();

    let form: Form = {
        id: "testForm",
        name: "",
        icon: "",
        format: [],
        snapshotId: "",
        questions: [],
    };

    await journalService.logEntry(form,
        {"test": pDisplay(pNumber(20.0), pString("13.0"))}, form.format, 0);
    await journalService.logEntry(form,
        {"test": pDisplay(pNumber(15.0), pString("17.0"))}, form.format, 0);

    let val = await graph.evaluateVariable(graph.getVariableById(goal.id),
        tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0), false, []);

    expect(val).toEqual(pMap({
        "condition1": pComparisonResult(pNumber(35.0), pNumber(30.0), true)
    }));
});
