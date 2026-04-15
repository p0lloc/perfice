import {expect, test} from "vitest";
import {RestDayService} from "../../src/services/sport/restday";
import {DummyRestDayCollection} from "../dummy-collections";

// TP-2.1: Toggle rest day ON creates a RestDay record
test("toggle ON creates rest day record", async () => {
    let collection = new DummyRestDayCollection();
    let service = new RestDayService(collection);

    await service.toggle("2026-03-30");

    let isRest = await service.isRestDay("2026-03-30");
    expect(isRest).toBe(true);
});

// TP-2.2: Toggle rest day OFF deletes the RestDay record
test("toggle OFF deletes rest day record", async () => {
    let collection = new DummyRestDayCollection([
        {id: "r1", date: "2026-03-30", timestamp: 1000}
    ]);
    let service = new RestDayService(collection);

    await service.toggle("2026-03-30");

    let isRest = await service.isRestDay("2026-03-30");
    expect(isRest).toBe(false);
});

// TP-2.3: Toggle ON is idempotent
test("toggle ON twice results in exactly one record", async () => {
    let collection = new DummyRestDayCollection();
    let service = new RestDayService(collection);

    await service.toggle("2026-03-30"); // create
    await service.toggle("2026-03-30"); // delete (toggle off)
    await service.toggle("2026-03-30"); // create again

    let isRest = await service.isRestDay("2026-03-30");
    expect(isRest).toBe(true);

    let allRestDays = await service.getRestDays();
    let matchingDays = allRestDays.filter(r => r.date === "2026-03-30");
    expect(matchingDays.length).toBe(1);
});

// TP-2.4: Query rest days by date range
test("query rest days by date range returns correct days", async () => {
    let collection = new DummyRestDayCollection([
        {id: "r1", date: "2026-03-25", timestamp: 1000},
        {id: "r2", date: "2026-03-27", timestamp: 2000},
        {id: "r3", date: "2026-03-30", timestamp: 3000},
    ]);
    let service = new RestDayService(collection);

    let result = await service.getRestDaysInRange("2026-03-24", "2026-03-30");
    expect(result.length).toBe(3);
});
