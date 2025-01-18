import {expect, test} from "vitest";
import {dateToWeekEnd, dateToWeekStart} from "../src/util/time/simple";
import {WeekStart} from "../src/model/variable/time/time";

test("date to week start sunday", () => {
    let date = new Date();
    expect(dateToWeekStart(date, WeekStart.SUNDAY).getTime())
        .toEqual(new Date(2025, 0, 12, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).getTime())
})

test("date to week start monday", () => {
    let date = new Date();
    expect(dateToWeekStart(date, WeekStart.MONDAY).getTime())
        .toEqual(new Date(2025, 0, 13, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).getTime())
})

test("date to week end monday", () => {
    let date = new Date();
    expect(dateToWeekEnd(date, WeekStart.MONDAY).getTime())
        .toEqual(new Date(2025, 0, 19, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).getTime())
})

