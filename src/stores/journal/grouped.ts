import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import {derived, type Readable} from "svelte/store";
import {forms, journal, tagEntries, tags} from "@perfice/main";
import {timestampToMidnight} from "@perfice/util/time/simple";
import {JournalEntryStore} from "@perfice/stores/journal/entry";
import type {TagEntryStore} from "@perfice/stores/journal/tag";
import type {FormStore} from "@perfice/stores/form/form";
import type {TagStore} from "@perfice/stores/tag/tag";
import type {Form} from "@perfice/model/form/form";
import type {Tag} from "@perfice/model/tag/tag";


export type TransformedJournalEntry = JournalEntry & {
    form: Form;
}

export type TransformedTagEntry = TagEntry & {
    tag: Tag;
}

export interface JournalDay {
    timestamp: number;
    singleEntries: JournalDayGroup[];
    multiEntries: JournalDayGroup[];
    tagEntries: TransformedTagEntry[];
}

export interface JournalDayGroup {
    id: string;
    name: string;
    icon: string;
    entries: TransformedJournalEntry[];
}

function newGroup(entry: TransformedJournalEntry): JournalDayGroup {
    return {
        id: entry.formId,
        name: entry.form.name,
        icon: entry.form.icon,
        entries: [
            entry
        ]
    }
}

function newGroupMap(entry: TransformedJournalEntry): Map<string, JournalDayGroup> {
    let map: Map<string, JournalDayGroup> = new Map();
    map.set(entry.formId, newGroup(entry));

    return map;
}

function newJournalDayData(groupMap?: Map<string, JournalDayGroup>, tags?: TransformedTagEntry[]): JournalDayData {
    return {
        formGroups: groupMap ?? new Map(),
        tagEntries: tags ?? []
    }
}

interface JournalDayData {
    formGroups: Map<string, JournalDayGroup>;
    tagEntries: TransformedTagEntry[];
}

export interface IGroupedJournal extends Readable<Promise<JournalDay[]>> {
    load(): Promise<void>;

    nextPage(): Promise<void>;
}

export function GroupedJournal(): IGroupedJournal {

    const PAGE_SIZE = 20;
    let currentPage = new Date().getTime();

    let {subscribe} = derived<[JournalEntryStore, TagEntryStore, FormStore, TagStore], Promise<JournalDay[]>>([journal, tagEntries, forms, tags],
        ([$entries, $tagEntries, $forms, $tags], set) => {
            set(new Promise<JournalDay[]>(async (resolve) => {
                    let journalEntries = await $entries;
                    let tagEntries = await $tagEntries;
                    let forms = await $forms;
                    let tags = await $tags;

                    let mapping: Map<number, JournalDayData> = new Map();

                    for (let rawEntry of journalEntries) {
                        let timestamp = timestampToMidnight(rawEntry.timestamp);
                        let day = mapping.get(timestamp);

                        let form = forms.find(f => f.id == rawEntry.formId);
                        if (form == undefined) continue;

                        let entry: TransformedJournalEntry = {
                            ...rawEntry,
                            form
                        }

                        if (day == undefined) {
                            mapping.set(timestamp, newJournalDayData(newGroupMap(entry)));
                        } else {
                            let group = day.formGroups.get(entry.formId);
                            if (group == undefined) {
                                day.formGroups.set(entry.formId, newGroup(entry));
                            } else {
                                group.entries.push(entry);
                            }
                        }
                    }

                    for (let rawEntry of tagEntries) {
                        let timestamp = timestampToMidnight(rawEntry.timestamp);
                        let day = mapping.get(timestamp);

                        let tag = tags.find(t => t.id == rawEntry.tagId);
                        if (tag == undefined) {
                            continue;
                        }

                        let entry: TransformedTagEntry = {
                            ...rawEntry,
                            tag
                        }

                        if (day == undefined) {
                            mapping.set(timestamp, newJournalDayData(undefined, [entry]));
                        } else {
                            day.tagEntries.push(entry);
                        }
                    }

                    let grouped: JournalDay[] = [];
                    for (let [timestamp, dayData] of mapping.entries()) {
                        let singleEntries: JournalDayGroup[] = [];
                        let multiEntries: JournalDayGroup[] = [];

                        for (let group of dayData.formGroups.values()) {
                            if (group.entries.length == 1) {
                                singleEntries.push(group);
                            } else {
                                multiEntries.push(group);
                            }
                        }

                        grouped.push({
                            timestamp,
                            singleEntries,
                            multiEntries,
                            tagEntries: dayData.tagEntries
                        });
                    }

                    resolve(grouped.sort((a, b) => b.timestamp - a.timestamp));
                }
            ));
        });

    async function load() {
        // Load tags so we can display names in the UI
        await tags.load();

        currentPage = new Date().getTime();

        await journal.init();
        await tagEntries.init();
        await nextPage();
    }

    async function nextPage() {
        let formEntries = await journal.nextPage(currentPage, PAGE_SIZE);
        let taggedEntries = await tagEntries.nextPage(currentPage, PAGE_SIZE);

        let oldestJournalEntry = formEntries.length > 0 ? formEntries[formEntries.length - 1].timestamp : currentPage;
        let oldestTagEntry = taggedEntries.length > 0 ? taggedEntries[taggedEntries.length - 1].timestamp : currentPage;
        // Entries might be uneven so only include up to the oldest entry even if there are more
        if (oldestJournalEntry > oldestTagEntry) {
            taggedEntries = taggedEntries.filter(e => e.timestamp >= oldestJournalEntry);
            currentPage = oldestJournalEntry;
        } else {
            formEntries = formEntries.filter(e => e.timestamp >= oldestTagEntry);
            currentPage = oldestTagEntry;
        }

        journal.updateResolved(v => [...v, ...formEntries]);
        tagEntries.updateResolved(v => [...v, ...taggedEntries]);
    }

    return {
        subscribe,
        load,
        nextPage
    };
}
