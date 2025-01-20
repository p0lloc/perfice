import {expect, test} from "vitest";
import {dateToWeekEnd, dateToWeekStart} from "../src/util/time/simple";
import {WeekStart} from "../src/model/variable/time/time";

test("date to week start sunday", () => {
    let date = new Date(2025, 0, 16);
    expect(dateToWeekStart(date, WeekStart.SUNDAY).getTime())
        .toEqual(Date.UTC(2025, 0, 12, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()))
})

test("date to week start monday", () => {
    let date = new Date(Date.UTC(2025, 0, 16));
    expect(dateToWeekStart(date, WeekStart.MONDAY).getTime())
        .toEqual(Date.UTC(2025, 0, 13, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()))
})

test("date to week end monday", () => {
    let date = new Date(Date.UTC(2025, 0, 16));
    expect(dateToWeekEnd(date, WeekStart.MONDAY).getTime())
        .toEqual(Date.UTC(2025, 0, 19, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()))
})

