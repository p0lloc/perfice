import {expect, test} from "vitest";
import {PAGE_SIZE, PaginatedJournal} from "../../src/stores/journal/grouped";
import {JournalEntryStore} from "../../src/stores/journal/entry";
import {BaseJournalService} from "../../src/services/journal/journal";
import {
    DummyIndexCollection,
    DummyJournalCollection,
    DummyTagCollection,
    DummyTagEntryCollection,
    DummyVariableCollection
} from "../dummy-collections";
import {TagEntryStore} from "../../src/stores/journal/tag";
import {TagEntryService} from "../../src/services/tag/entry";
import {TagStore} from "../../src/stores/tag/tag";
import {TagService} from "../../src/services/tag/tag";
import {VariableService} from "../../src/services/variable/variable";
import {VariableGraph} from "../../src/services/variable/graph";
import {WeekStart} from "../../src/model/variable/time/time";
import {Form} from "../../src/model/form/form";
import {pDisplay, pNumber, pString} from "../../src/model/primitive/primitive";

async function setup(): Promise<{
    journalService: BaseJournalService,
    paginated: PaginatedJournal,
}> {

    const tagEntries = new DummyTagEntryCollection();
    const tagEntryService = new TagEntryService(tagEntries);

    const indices = new DummyIndexCollection();
    const journal = new DummyJournalCollection([]);
    const variables = new DummyVariableCollection();

    const journalService = new BaseJournalService(journal);
    const graph = new VariableGraph(indices, journal, tagEntries, WeekStart.MONDAY);

    const variableService = new VariableService(variables, indices, graph);


    const paginated = new PaginatedJournal(
        new JournalEntryStore(journalService),
        new TagEntryStore(tagEntryService),
        new TagStore(new TagService(new DummyTagCollection(), variableService, tagEntryService))
    );

    await paginated.load();

    return {
        journalService,
        paginated
    }
}

test("empty pagination", async () => {
    const {paginated} = await setup();

    expect(await paginated.nextPage()).toEqual({
        journalEntries: [],
        tagEntries: []
    });
});

function mockForm(): Form {
    return {
        id: "testForm",
        name: "",
        icon: "",
        format: [],
        snapshotId: "",
        questions: [],
    }
}

test("entry not part of first page", async () => {
    const {paginated, journalService} = await setup();

    const form = mockForm();
    for (let i = 0; i < PAGE_SIZE; i++) {
        await journalService.logEntry(mockForm(),
            {"test": pDisplay(pNumber(20.0), pString("13.0"))}, form.format, i + 1);
    }

    let entry = await journalService.logEntry(form,
        {"test": pDisplay(pNumber(20.0), pString("13.0"))}, form.format, 0);

    expect((await paginated.nextPage()).journalEntries).not.toContainEqual(entry);
});

test("entry part of second page", async () => {
    const {paginated, journalService} = await setup();

    const form = mockForm();
    for (let i = 0; i < PAGE_SIZE; i++) {
        await journalService.logEntry(mockForm(),
            {"test": pDisplay(pNumber(20.0), pString("13.0"))}, form.format, i + 1);
    }

    // This entry is old (timestamp == 0), so it should not be part of the first page
    let entry = await journalService.logEntry(form,
        {"test": pDisplay(pNumber(20.0), pString("13.0"))}, form.format, 0);

    // Not part of first, but part of second page
    expect((await paginated.nextPage()).journalEntries).not.toContainEqual(entry);
    expect((await paginated.nextPage()).journalEntries).toContainEqual(entry);
});
