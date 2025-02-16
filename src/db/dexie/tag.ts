import type { TagEntry } from "@perfice/model/journal/journal";
import type {Tag} from "@perfice/model/tag/tag";
import type {EntityTable} from "dexie";
import type {TagCollection, TagEntryCollection} from "@perfice/db/collections";

export class DexieTagEntryCollection implements TagEntryCollection {

    private table: EntityTable<TagEntry, "id">;

    constructor(table: EntityTable<TagEntry, "id">) {
        this.table = table;
    }

    async createEntry(entry: TagEntry): Promise<void> {
        await this.table.add(entry);
    }

    getTagEntriesByTagId(tagId: string): Promise<TagEntry[]> {
        return this.table.where("tagId").equals(tagId).toArray();
    }

    async getAllEntriesByTagId(tagId: string): Promise<TagEntry[]> {
        return this.table.where("tagId").equals(tagId).toArray();
    }

    async getEntriesByTagIdAndTimeRange(tagId: string, start: number, end: number): Promise<TagEntry[]> {
        return this.table.where("[tagId+timestamp]").between([tagId, start], [tagId, end])
            .toArray();
    }

    async getEntriesByTagIdFromTime(tagId: string, lower: number): Promise<TagEntry[]> {
        return this.table.where("timestamp")
            .aboveOrEqual(lower)
            .and(v => v.tagId == tagId)
            .toArray();
    }

    async getEntriesByTagIdUntilTime(tagId: string, upper: number): Promise<TagEntry[]> {
        return this.table.where("timestamp")
            .belowOrEqual(upper)
            .and(v => v.tagId == tagId)
            .toArray();
    }

    async deleteEntriesByTagId(tagId: string): Promise<void> {
        await this.table.delete(tagId);
    }

    async deleteEntryById(id: string): Promise<void> {
        await this.table.delete(id);
    }

}

export class DexieTagCollection implements TagCollection {

    private table: EntityTable<Tag, "id">;

    constructor(table: EntityTable<Tag, "id">) {
        this.table = table;
    }

    getTags(): Promise<Tag[]> {
        return this.table.toArray();
    }

    async getTagById(id: string): Promise<Tag | undefined> {
        return this.table.get(id);
    }

    async createTag(tag: Tag): Promise<void> {
        await this.table.add(tag);
    }

    async updateTag(tag: Tag): Promise<void> {
        await this.table.put(tag);
    }

    async deleteTagById(id: string): Promise<void> {
        await this.table.delete(id);
    }
}
