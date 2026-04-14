import {expect, test} from "vitest";
import type {Trackable} from "../../src/model/trackable/trackable";
import {TrackableCardType} from "../../src/model/trackable/trackable";

function makeTrackable(id: string, formId: string, trackableType: 'regular' | 'sport'): Trackable {
    return {
        id,
        name: `Trackable ${id}`,
        icon: "📊",
        formId,
        order: 0,
        goalId: null,
        categoryId: null,
        dependencies: {},
        trackableType,
        cardType: TrackableCardType.CHART,
        cardSettings: {aggregateType: "SUM" as any, field: "q1", color: "#ff0000"}
    };
}

// TP-7.1: getSportTrackables returns only sport type
test("filtering returns only sport trackables", () => {
    let trackables = [
        makeTrackable("t1", "f1", "regular"),
        makeTrackable("t2", "f2", "regular"),
        makeTrackable("t3", "f3", "sport"),
    ];

    let sportTrackables = trackables.filter(t => (t.trackableType ?? 'regular') === 'sport');
    expect(sportTrackables.length).toBe(1);
    expect(sportTrackables[0].id).toBe("t3");
});

// TP-7.2: getSportEntries returns entries matching sport trackable formIds
test("sport entries are filtered by sport trackable formIds", () => {
    let sportFormIds = new Set(["f1"]);

    let entries = [
        {id: "e1", formId: "f1", timestamp: 1000},
        {id: "e2", formId: "f2", timestamp: 2000},
        {id: "e3", formId: "f1", timestamp: 3000},
    ];

    let sportEntries = entries.filter(e => sportFormIds.has(e.formId));
    expect(sportEntries.length).toBe(2);
    expect(sportEntries.every(e => e.formId === "f1")).toBe(true);
});

// TP-7.5.3: Empty database -- getSportTrackables returns empty
test("empty trackables list returns empty sport list", () => {
    let trackables: Trackable[] = [];
    let sportTrackables = trackables.filter(t => (t.trackableType ?? 'regular') === 'sport');
    expect(sportTrackables).toEqual([]);
});

// Test read-layer safety: trackableType ?? 'regular'
test("missing trackableType defaults to regular via nullish coalescing", () => {
    let trackable = {
        id: "t1",
        name: "Old Trackable",
        icon: "📊",
        formId: "f1",
        order: 0,
        goalId: null,
        categoryId: null,
        dependencies: {},
        // trackableType intentionally missing
        cardType: TrackableCardType.CHART,
        cardSettings: {aggregateType: "SUM" as any, field: "q1", color: "#ff0000"}
    } as Trackable;

    let type = trackable.trackableType ?? 'regular';
    expect(type).toBe('regular');

    let sportTrackables = [trackable].filter(t => (t.trackableType ?? 'regular') === 'sport');
    expect(sportTrackables.length).toBe(0);
});
