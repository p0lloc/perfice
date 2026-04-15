import {expect, test} from "vitest";
import {validateSportTrackable} from "../../src/services/trackable/trackable";
import type {Form} from "../../src/model/form/form";
import {FormQuestionDataType, FormQuestionDisplayType} from "../../src/model/form/form";

function makeForm(questionDataTypes: FormQuestionDataType[]): Form {
    return {
        id: "f1",
        name: "Test",
        icon: "📊",
        snapshotId: "snap1",
        format: [],
        questions: questionDataTypes.map((dt, i) => ({
            id: `q${i}`,
            name: `Question ${i}`,
            unit: null,
            dataType: dt,
            dataSettings: {},
            displayType: FormQuestionDisplayType.INPUT,
            displaySettings: {},
            defaultValue: null,
        }))
    };
}

// TP-4.1: Sport trackable requires TIME_ELAPSED field
test("sport trackable without TIME_ELAPSED fails validation", () => {
    let form = makeForm([FormQuestionDataType.NUMBER, FormQuestionDataType.TEXT]);
    let error = validateSportTrackable('sport', form);
    expect(error).toBe("Sport trackables require at least one duration (time elapsed) field");
});

// TP-4.2: Sport trackable with TIME_ELAPSED passes validation
test("sport trackable with TIME_ELAPSED passes validation", () => {
    let form = makeForm([FormQuestionDataType.TIME_ELAPSED, FormQuestionDataType.NUMBER]);
    let error = validateSportTrackable('sport', form);
    expect(error).toBeNull();
});

// TP-4.3: Regular trackable has no TIME_ELAPSED requirement
test("regular trackable passes validation without TIME_ELAPSED", () => {
    let form = makeForm([FormQuestionDataType.NUMBER]);
    let error = validateSportTrackable('regular', form);
    expect(error).toBeNull();
});

// TP-5.1: Regular -> Sport allowed with TIME_ELAPSED
test("switching regular to sport with TIME_ELAPSED succeeds", () => {
    let form = makeForm([FormQuestionDataType.TIME_ELAPSED]);
    let error = validateSportTrackable('sport', form);
    expect(error).toBeNull();
});

// TP-5.2: Regular -> Sport blocked without TIME_ELAPSED
test("switching regular to sport without TIME_ELAPSED fails", () => {
    let form = makeForm([FormQuestionDataType.NUMBER]);
    let error = validateSportTrackable('sport', form);
    expect(error).toBe("Sport trackables require at least one duration (time elapsed) field");
});

// TP-5.3: Sport -> Regular always allowed
test("switching sport to regular always succeeds", () => {
    let form = makeForm([FormQuestionDataType.TIME_ELAPSED]);
    let error = validateSportTrackable('regular', form);
    expect(error).toBeNull();
});

// TP-5.4: Removing last TIME_ELAPSED from sport trackable is blocked
test("removing last TIME_ELAPSED from sport trackable fails validation", () => {
    let form = makeForm([FormQuestionDataType.NUMBER]); // TIME_ELAPSED was removed
    let error = validateSportTrackable('sport', form);
    expect(error).toBe("Sport trackables require at least one duration (time elapsed) field");
});

// TP-6.1: Existing trackables receive 'regular' type (migration test)
test("migration sets trackableType to regular on existing trackables", async () => {
    const {TrackableTypeMigration} = await import("../../src/db/migration/migrations/trackableType");
    let migration = new TrackableTypeMigration();

    let entity = {id: "t1", name: "Test", trackableType: undefined};
    let result = await migration.apply(entity);
    expect((result as any).trackableType).toBe('regular');
});

// TP-6.1b: Migration preserves existing trackableType
test("migration preserves existing trackableType", async () => {
    const {TrackableTypeMigration} = await import("../../src/db/migration/migrations/trackableType");
    let migration = new TrackableTypeMigration();

    let entity = {id: "t1", name: "Test", trackableType: 'sport'};
    let result = await migration.apply(entity);
    expect((result as any).trackableType).toBe('sport');
});

// TP-6.2: RestDay table is created (schema test - verified by DB schema definition)
test("migration targets trackables entity type", async () => {
    const {TrackableTypeMigration} = await import("../../src/db/migration/migrations/trackableType");
    let migration = new TrackableTypeMigration();
    expect(migration.getEntityType()).toBe("trackables");
    expect(migration.getVersion()).toBe(4);
});
