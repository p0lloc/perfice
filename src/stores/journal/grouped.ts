import type {JournalEntry} from "@perfice/model/journal/journal";
import {derived, type Readable} from "svelte/store";
import {journal} from "@perfice/main";
import {timestampToMidnight} from "@perfice/util/time/simple";

export interface JournalDay {
    timestamp: number;
    singleEntries: JournalDayGroup[];
    multiEntries: JournalDayGroup[];
}

export interface JournalDayGroup {
    id: string;
    name: string;
    icon: string;
    entries: JournalEntry[];
}

function newGroup(entry: JournalEntry): JournalDayGroup {
    return {
        id: entry.formId,
        name: entry.name,
        icon: entry.icon,
        entries: [
            entry
        ]
    }
}

function newGroupMap(entry: JournalEntry): Map<string, JournalDayGroup> {
    let map: Map<string, JournalDayGroup> = new Map();
    map.set(entry.formId, newGroup(entry));

    return map;
}

export function GroupedJournal() {
    let {subscribe} = derived<Readable<Promise<JournalEntry[]>>, Promise<JournalDay[]>>(journal,
        ($entries, set) => {
            set(new Promise(async (resolve) => {
                    let entries = await $entries;

                    let grouped: JournalDay[] = [];
                    let mapping: Map<number, Map<string, JournalDayGroup>> = new Map();

                    for (let entry of entries) {
                        let timestamp = timestampToMidnight(entry.timestamp);
                        let groups = mapping.get(timestamp);
                        if (groups == undefined) {
                            mapping.set(timestamp, newGroupMap(entry));
                        } else {
                            let group = groups.get(entry.formId);
                            if (group == undefined) {
                                groups.set(entry.formId, newGroup(entry));
                            } else {
                                group.entries.push(entry);
                            }
                        }
                    }


                    for (let [timestamp, groups] of mapping.entries()) {
                        let singleEntries: JournalDayGroup[] = [];
                        let multiEntries: JournalDayGroup[] = [];

                        for (let group of groups.values()) {
                            if (group.entries.length == 1) {
                                singleEntries.push(group);
                            } else {
                                multiEntries.push(group);
                            }
                        }

                        grouped.push({
                            timestamp,
                            singleEntries,
                            multiEntries
                        });
                    }

                    resolve(grouped);
                }
            ));
        });

    async function load() {
        await journal.init();
    }

    async function nextPage() {
        await journal.nextPage();
    }

    return {
        subscribe,
        load,
        nextPage
    };
}
