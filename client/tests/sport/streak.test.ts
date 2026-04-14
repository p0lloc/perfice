import {expect, test} from "vitest";
import {SportStreakService} from "../../src/services/sport/streak";
import {mockEntry} from "../common";
import {pNumber} from "../../src/model/primitive/primitive";
import type {RestDay} from "../../src/model/sport/restday";

const streakService = new SportStreakService();

function makeRestDay(date: string): RestDay {
    return {id: crypto.randomUUID(), date, timestamp: Date.now()};
}

function dayDate(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day, 12, 0, 0); // noon to avoid timezone issues
}

function dayTimestamp(year: number, month: number, day: number): number {
    return dayDate(year, month, day).getTime();
}

// TP-1.1: Basic streak counting
test("consecutive days produce correct streak count", () => {
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 23)), // Mon
        mockEntry("e2", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 24)), // Tue
        mockEntry("e3", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 25)), // Wed
    ];
    let result = streakService.calculateStreak(entries, [], dayDate(2026, 3, 25));
    expect(result).toBe(3);
});

// TP-1.2: Streak breaks on inactive day
test("missing day breaks streak", () => {
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 23)), // Mon
        mockEntry("e2", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 24)), // Tue
        // Wed missing
        mockEntry("e3", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 26)), // Thu
    ];
    let result = streakService.calculateStreak(entries, [], dayDate(2026, 3, 26));
    expect(result).toBe(1);
});

// TP-1.3: Rest day preserves but doesn't increment streak
test("rest day preserves streak without incrementing", () => {
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 23)), // Mon
        // Tue is rest day
        mockEntry("e2", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 25)), // Wed
    ];
    let restDays = [makeRestDay("2026-03-24")]; // Tue
    let result = streakService.calculateStreak(entries, restDays, dayDate(2026, 3, 25));
    expect(result).toBe(2);
});

// TP-1.4: Today with no entry is "pending" -- doesn't break streak
test("today pending does not break streak", () => {
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 23)), // Mon
        mockEntry("e2", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 24)), // Tue
        mockEntry("e3", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 25)), // Wed
    ];
    // Today is Thu with no entry
    let result = streakService.calculateStreak(entries, [], dayDate(2026, 3, 26));
    expect(result).toBe(3);
});

// TP-1.5: Today with entry counts toward streak
test("today with entry counts toward streak", () => {
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 24)), // Tue
        mockEntry("e2", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 25)), // Wed
        mockEntry("e3", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 26)), // Thu (today)
    ];
    let result = streakService.calculateStreak(entries, [], dayDate(2026, 3, 26));
    expect(result).toBe(3);
});

// TP-1.6: Today is rest day -- preserves, start counting from yesterday
test("today as rest day preserves streak", () => {
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 24)), // Tue
        mockEntry("e2", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 25)), // Wed
    ];
    let restDays = [makeRestDay("2026-03-26")]; // Thu (today) is rest
    let result = streakService.calculateStreak(entries, restDays, dayDate(2026, 3, 26));
    expect(result).toBe(2);
});

// TP-1.7: Multiple entries same day count as 1
test("multiple entries on same day count as one", () => {
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 23)),  // Mon
        mockEntry("e1b", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 23)), // Mon again
        mockEntry("e2", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 24)),  // Tue
    ];
    let result = streakService.calculateStreak(entries, [], dayDate(2026, 3, 24));
    expect(result).toBe(2);
});

// TP-1.8: Rest day AND sport entry on same day -- sport takes precedence
test("sport entry takes precedence over rest day on same day", () => {
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 23)), // Mon
        mockEntry("e2", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 24)), // Tue
    ];
    let restDays = [makeRestDay("2026-03-23")]; // Mon is also rest
    let result = streakService.calculateStreak(entries, restDays, dayDate(2026, 3, 24));
    expect(result).toBe(2);
});

// TP-1.9: Empty history -- streak is 0
test("empty history gives streak 0", () => {
    let result = streakService.calculateStreak([], [], dayDate(2026, 3, 25));
    expect(result).toBe(0);
});

// TP-1.10: All rest days, no sport entries -- streak is 0
test("all rest days with no entries gives streak 0", () => {
    let restDays = [
        makeRestDay("2026-03-23"),
        makeRestDay("2026-03-24"),
        makeRestDay("2026-03-25"),
    ];
    let result = streakService.calculateStreak([], restDays, dayDate(2026, 3, 25));
    expect(result).toBe(0);
});

// TP-7.5.4: Streak with different week start settings
test("streak is day-based, independent of week start", () => {
    let entries = [
        mockEntry("e1", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 23)), // Mon
        mockEntry("e2", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 24)), // Tue
        mockEntry("e3", "f1", {q1: pNumber(1)}, dayTimestamp(2026, 3, 25)), // Wed
    ];
    // Streak service doesn't take weekStart -- it's always day-based
    let result = streakService.calculateStreak(entries, [], dayDate(2026, 3, 25));
    expect(result).toBe(3);
    // Same data, same result regardless of any external week start setting
});
