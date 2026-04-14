import {expect, test} from "vitest";
import {SportStatsService} from "../../src/services/sport/stats";
import {SportStreakService} from "../../src/services/sport/streak";
import {mockEntry} from "../common";
import {pNumber} from "../../src/model/primitive/primitive";
import type {Trackable} from "../../src/model/trackable/trackable";
import {TrackableCardType} from "../../src/model/trackable/trackable";
import type {Form} from "../../src/model/form/form";
import {FormQuestionDataType, FormQuestionDisplayType} from "../../src/model/form/form";

const streakService = new SportStreakService();
const statsService = new SportStatsService(streakService);

function makeSportTrackable(id: string, formId: string): Trackable {
    return {
        id,
        name: "Running",
        icon: "🏃",
        formId,
        order: 0,
        goalId: null,
        categoryId: null,
        dependencies: {},
        trackableType: 'sport',
        cardType: TrackableCardType.CHART,
        cardSettings: {aggregateType: "SUM" as any, field: "q1", color: "#ff0000"}
    };
}

function makeSportForm(formId: string, questionIds: string[]): Form {
    return {
        id: formId,
        name: "Running",
        icon: "🏃",
        snapshotId: "snap1",
        format: [],
        questions: questionIds.map(qId => ({
            id: qId,
            name: "Duration",
            unit: null,
            dataType: FormQuestionDataType.TIME_ELAPSED,
            dataSettings: {},
            displayType: FormQuestionDisplayType.INPUT,
            displaySettings: {},
            defaultValue: null,
        }))
    };
}

function dayTimestamp(year: number, month: number, day: number): number {
    return new Date(year, month - 1, day, 12, 0, 0).getTime();
}

function dayDate(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day, 12, 0, 0);
}

// TP-3.1: Session count for a week
test("session count equals number of sport entries in week", () => {
    let weekStart = dayDate(2026, 3, 23); // Mon
    let weekEnd = dayDate(2026, 3, 29);   // Sun end
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(900000)}, dayTimestamp(2026, 3, 23)),
        mockEntry("e2", "f1", {q1: pNumber(900000)}, dayTimestamp(2026, 3, 25)),
        mockEntry("e3", "f1", {q1: pNumber(900000)}, dayTimestamp(2026, 3, 27)),
    ];
    let trackables = [makeSportTrackable("t1", "f1")];
    let forms = [makeSportForm("f1", ["q1"])];

    let stats = statsService.computeWeekStats(entries, trackables, forms, [], weekStart, weekEnd, weekStart);
    expect(stats.sessions).toBe(3);
});

// TP-3.2: Duration sums all TIME_ELAPSED fields
test("duration sums all TIME_ELAPSED fields in entry", () => {
    let weekStart = dayDate(2026, 3, 23);
    let weekEnd = dayDate(2026, 3, 29);
    // Entry with two TIME_ELAPSED fields: Warmup=15min, MainSet=45min
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(900000), q2: pNumber(2700000)}, dayTimestamp(2026, 3, 23)),
    ];
    let trackables = [makeSportTrackable("t1", "f1")];
    let forms = [makeSportForm("f1", ["q1", "q2"])];

    let stats = statsService.computeWeekStats(entries, trackables, forms, [], weekStart, weekEnd, weekStart);
    expect(stats.totalDurationMs).toBe(3600000); // 1h
    expect(statsService.formatDuration(stats.totalDurationMs)).toBe("1h 0m");
});

// TP-3.3: Duration across multiple entries
test("duration sums across multiple entries", () => {
    let weekStart = dayDate(2026, 3, 23);
    let weekEnd = dayDate(2026, 3, 29);
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1800000)}, dayTimestamp(2026, 3, 23)),  // 30min
        mockEntry("e2", "f1", {q1: pNumber(2700000)}, dayTimestamp(2026, 3, 24)),  // 45min
    ];
    let trackables = [makeSportTrackable("t1", "f1")];
    let forms = [makeSportForm("f1", ["q1"])];

    let stats = statsService.computeWeekStats(entries, trackables, forms, [], weekStart, weekEnd, weekStart);
    expect(stats.totalDurationMs).toBe(4500000); // 75min
    expect(statsService.formatDuration(stats.totalDurationMs)).toBe("1h 15m");
});

// TP-3.4: Zero entries in week
test("zero entries gives zero sessions and zero duration", () => {
    let weekStart = dayDate(2026, 3, 23);
    let weekEnd = dayDate(2026, 3, 29);
    let trackables = [makeSportTrackable("t1", "f1")];
    let forms = [makeSportForm("f1", ["q1"])];

    let stats = statsService.computeWeekStats([], trackables, forms, [], weekStart, weekEnd, weekStart);
    expect(stats.sessions).toBe(0);
    expect(statsService.formatDuration(stats.totalDurationMs)).toBe("0h 0m");
});

// TP-3.5: Duration format is always Xh Ym
test("duration format is always Xh Ym", () => {
    expect(statsService.formatDuration(2700000)).toBe("0h 45m"); // 45 minutes
    expect(statsService.formatDuration(0)).toBe("0h 0m");
    expect(statsService.formatDuration(3600000)).toBe("1h 0m");
    expect(statsService.formatDuration(5400000)).toBe("1h 30m");
});

// TP-7.5.1: Zero-duration TIME_ELAPSED entry
test("zero-duration entry counts as session with 0h 0m", () => {
    let weekStart = dayDate(2026, 3, 23);
    let weekEnd = dayDate(2026, 3, 29);
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(0)}, dayTimestamp(2026, 3, 23)),
    ];
    let trackables = [makeSportTrackable("t1", "f1")];
    let forms = [makeSportForm("f1", ["q1"])];

    let stats = statsService.computeWeekStats(entries, trackables, forms, [], weekStart, weekEnd, weekStart);
    expect(stats.sessions).toBe(1);
    expect(stats.totalDurationMs).toBe(0);
    expect(statsService.formatDuration(stats.totalDurationMs)).toBe("0h 0m");
});

// TP-7.5.2: Very large duration formatting
test("very large duration formats correctly", () => {
    expect(statsService.formatDuration(6000 * 60000)).toBe("100h 0m"); // 6000 minutes
});
