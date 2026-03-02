import {expect, test} from "vitest";
import {groupEntries, PAGE_SIZE, PaginatedJournal} from "../../src/stores/journal/grouped";
import {pDisplay, pNumber, pString} from "../../src/model/primitive/primitive";
import {BaseJournalService, JournalService} from "../../src/services/journal/journal";
import {
    DummyIndexCollection,
    DummyJournalCollection, DummyTagCollection,
    DummyTagEntryCollection,
    DummyVariableCollection
} from "../dummy-collections";
import {TagEntryService} from "../../src/services/tag/entry";
import {VariableGraph} from "../../src/services/variable/graph";
import {WeekStart} from "../../src/model/variable/time/time";
import {VariableService} from "../../src/services/variable/variable";
import {JournalEntryStore} from "../../src/stores/journal/entry";
import {TagEntryStore} from "../../src/stores/journal/tag";
import {TagStore} from "../../src/stores/tag/tag";
import {TagService} from "../../src/services/tag/tag";
import {Form} from "../../src/model/form/form";


function mockForm(id: string = "testForm"): Form {
    return {
        id,
        name: "",
        icon: "",
        format: [],
        snapshotId: "",
        questions: [],
    }
}

async function setup(): Promise<{
    journalService: JournalService,
    paginated: PaginatedJournal,
    tagService: TagService,
    tagEntryService: TagEntryService,
}> {

    const tagEntries = new DummyTagEntryCollection();
    const tagEntryService = new TagEntryService(tagEntries);

    const indices = new DummyIndexCollection();
    const journal = new DummyJournalCollection([]);
    const variables = new DummyVariableCollection();

    const journalService = new BaseJournalService(journal);
    const graph = new VariableGraph(indices, journal, tagEntries, WeekStart.MONDAY);

    const variableService = new VariableService(variables, indices, graph);

    const tagService = new TagService(new DummyTagCollection(), variableService, tagEntryService);
    const paginated = new PaginatedJournal(
        new JournalEntryStore(journalService),
        new TagEntryStore(tagEntryService),
        new TagStore(tagService)
    );

    await paginated.load();

    return {
        journalService,
        paginated,
        tagService,
        tagEntryService
    }
}

test("basic grouping - single form", async () => {
    const {journalService, tagService, tagEntryService} = await setup();

    const form = mockForm();
    const forms = [form];
    const entries = [];
    for (let i = 0; i < PAGE_SIZE; i++) {
        entries.push(await journalService.logEntry(mockForm(),
            {"test": pDisplay(pNumber(20.0), pString("13.0"))}, form.format, 1));
    }

    const tags = await tagService.getTags();
    const tagEntries = await tagEntryService.getAllEntries();
    const journalEntries = await journalService.getAllEntries();

    let grouped = groupEntries(journalEntries, tagEntries, forms, tags);
    expect(grouped).toEqual([
        {
            timestamp: 0,
            singleEntries: [],
            multiEntries: [
                {
                    id: form.id,
                    name: form.name,
                    icon: form.icon,
                    entries: entries
                }
            ],
            tagEntries: []
        }
    ]);
});

test("basic grouping - multiple forms", async () => {
    const {journalService, tagService, tagEntryService} = await setup();

    const forms = [mockForm("form1"), mockForm("form2"), mockForm("form3")];

    let first = await journalService.logEntry(forms[0],
        {"test": pDisplay(pNumber(20.0), pString("13.0"))}, forms[0].format, 1);
    let second = await journalService.logEntry(forms[1],
        {"test": pDisplay(pNumber(20.0), pString("13.0"))}, forms[1].format, 1);
    let third = await journalService.logEntry(forms[2],
        {"test": pDisplay(pNumber(20.0), pString("13.0"))}, forms[2].format, 1);

    const tags = await tagService.getTags();
    const tagEntries = await tagEntryService.getAllEntries();
    const journalEntries = await journalService.getAllEntries();

    let grouped = groupEntries(journalEntries, tagEntries, forms, tags);
    expect(grouped).toEqual([
        {
            timestamp: 0,
            multiEntries: [],
            singleEntries: [
                {
                    id: "form1",
                    name: "",
                    icon: "",
                    entries: [first]
                },
                {
                    id: "form2",
                    name: "",
                    icon: "",
                    entries: [second]
                },
                {
                    id: "form3",
                    name: "",
                    icon: "",
                    entries: [third]
                }
            ],
            tagEntries: []
        }
    ]);
})
