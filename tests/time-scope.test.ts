import {expect, test} from "vitest";
import {dateToEndOfTimeScope, dateToStartOfTimeScope} from "../src/util/time/simple";
import {SimpleTimeScopeType, WeekStart} from "../src/model/variable/time/time";

test("date to start of week monday", () => {
    let date = new Date(2025, 0, 16);
    expect(dateToStartOfTimeScope(date, SimpleTimeScopeType.WEEKLY, WeekStart.MONDAY).getTime())
        .toEqual(Date.UTC(2025, 0, 13, 0, 0, 0, 0))
})

test("date to end of week monday", () => {
    let date = new Date(2025, 0, 16);
    expect(dateToEndOfTimeScope(date, SimpleTimeScopeType.WEEKLY, WeekStart.MONDAY).getTime())
        .toEqual(Date.UTC(2025, 0, 19, 23, 59, 59, 999))
})
