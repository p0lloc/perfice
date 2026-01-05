import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import {derived, type Readable} from "svelte/store";
import {dateToLastSecondOfDay, timestampToMidnight} from "@perfice/util/time/simple";
import type {Form} from "@perfice/model/form/form";
import type {Tag} from "@perfice/model/tag/tag";
import {getLastElementOfArray} from "@perfice/util/array";
import {MAX_ID} from "@perfice/db/dexie/journal";
import {AsyncStore} from "@perfice/stores/store";
import type {IJournalEntryStore} from "@perfice/stores/journal/entry";
import type {ITagEntryStore} from "@perfice/stores/journal/tag";
import type {ITagStore} from "@perfice/stores/tag/tag";
import {resolvedPromise} from "@perfice/util/promise";

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
    entries: JournalEntry[];
}

function newGroup(entry: JournalEntry, form: Form): JournalDayGroup {
    return {
        id: entry.formId,
        name: form.name,
        icon: form.icon,
        entries: [
            entry
        ]
    }
}

function newGroupMap(entry: JournalEntry, form: Form): Map<string, JournalDayGroup> {
    let map: Map<string, JournalDayGroup> = new Map();
    map.set(entry.formId, newGroup(entry, form));

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

export const PAGE_SIZE = 20;

export interface PaginationResult {
    journalEntries: JournalEntry[];
    tagEntries: TagEntry[];
}

export class PaginatedJournal extends AsyncStore<PaginationResult> {
    private currentPage = 0;
    private lastJournalEntryId = MAX_ID;
    private lastTagEntryId = MAX_ID;
    private loading = false;
    private reachedEnd = false;

    private journal: IJournalEntryStore;
    private tagEntries: ITagEntryStore;
    private tags: ITagStore;

    constructor(journal: IJournalEntryStore, tagEntries: ITagEntryStore, tags: ITagStore) {
        super(resolvedPromise({
            journalEntries: [],
            tagEntries: []
        }));
        this.journal = journal;
        this.tagEntries = tagEntries;
        this.tags = tags;
    }

    async load() {
        // Load tags so we can display names in the UI
        await this.tags.load();

        this.currentPage = dateToLastSecondOfDay(new Date()).getTime();

        await this.journal.init();
        await this.tagEntries.init();
        this.reachedEnd = false;
    }

    async nextPage(): Promise<PaginationResult> {
        // Prevent multiple loading requests from scrolling too quickly
        if (this.loading || this.reachedEnd) return this.get();

        this.loading = true;

        let formEntries = await this.journal.nextPage(this.currentPage, PAGE_SIZE, this.lastJournalEntryId);
        let taggedEntries = await this.tagEntries.nextPage(this.currentPage, PAGE_SIZE, this.lastTagEntryId);

        let oldestJournalEntry = getLastElementOfArray(formEntries);
        let oldestTagEntry = getLastElementOfArray(taggedEntries);

        let oldestJournalEntryTimestamp = oldestJournalEntry?.timestamp ?? 0;
        let oldestTagEntryTimestamp = oldestTagEntry?.timestamp ?? 0;

        if (formEntries.length > 0 && taggedEntries.length > 0) {
            // Entries might be uneven so only include entries after oldest entry (since we move backwards in time)
            if (oldestJournalEntryTimestamp > oldestTagEntryTimestamp) {
                taggedEntries = taggedEntries.filter(e => e.timestamp >= oldestJournalEntryTimestamp);
                this.currentPage = oldestJournalEntryTimestamp;
            } else {
                formEntries = formEntries.filter(e => e.timestamp >= oldestTagEntryTimestamp);
                this.currentPage = oldestTagEntryTimestamp;
            }
        } else {
            // If one of them has no more entries, we still want to load the next page
            this.currentPage = Math.max(oldestJournalEntryTimestamp, oldestTagEntryTimestamp);
        }

        // We need to recalculate the last ids because we might have filtered out some entries
        oldestJournalEntry = getLastElementOfArray(formEntries);
        oldestTagEntry = getLastElementOfArray(taggedEntries);

        if (oldestJournalEntry != null)
            this.lastJournalEntryId = oldestJournalEntry.id;
        if (oldestTagEntry != null)
            this.lastTagEntryId = oldestTagEntry.id;

        const v = await this.get();
        const value: PaginationResult = {
            journalEntries: [...v.journalEntries, ...formEntries],
            tagEntries: [...v.tagEntries, ...taggedEntries]
        };

        this.reachedEnd = formEntries.length == 0 && taggedEntries.length == 0;
        this.loading = false;

        this.setResolved(value);
        return value;
    }
}

export function GroupedJournal(pagination: AsyncStore<PaginationResult>, forms: AsyncStore<Form[]>, tags: AsyncStore<Tag[]>): Readable<Promise<JournalDay[]>> {
    let {subscribe} = derived<[AsyncStore<PaginationResult>, AsyncStore<Form[]>, AsyncStore<Tag[]>], Promise<JournalDay[]>>([pagination, forms, tags],
        ([$pagination, $forms, $tags], set) => {
            set(new Promise<JournalDay[]>(async (resolve) => {
                    let pagination = await $pagination;
                    let {journalEntries, tagEntries} = pagination;
                    let forms = await $forms;
                    let tags = await $tags;

                    let mapping: Map<number, JournalDayData> = new Map();

                    for (let entry of journalEntries) {
                        let timestamp = timestampToMidnight(entry.timestamp);
                        let day = mapping.get(timestamp);

                        let form = forms.find(f => f.id == entry.formId);
                        if (form == undefined) continue;

                        if (day == undefined) {
                            mapping.set(timestamp, newJournalDayData(newGroupMap(entry, form)));
                        } else {
                            let group = day.formGroups.get(entry.formId);
                            if (group == undefined) {
                                day.formGroups.set(entry.formId, newGroup(entry, form));
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

    return {
        subscribe,
    };
}
