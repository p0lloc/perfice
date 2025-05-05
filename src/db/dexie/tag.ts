import type {TagEntry} from "@perfice/model/journal/journal";
import type {Tag, TagCategory} from "@perfice/model/tag/tag";
import type {EntityTable} from "dexie";
import type {TagCategoryCollection, TagCollection, TagEntryCollection,} from "@perfice/db/collections";

export class DexieTagEntryCollection implements TagEntryCollection {

    private readonly table: EntityTable<TagEntry, "id">;

    constructor(table: EntityTable<TagEntry, "id">) {
        this.table = table;
    }

    async getEntryById(entryId: string): Promise<TagEntry | undefined> {
        return this.table.get(entryId);
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
        await this.table.where("tagId").equals(tagId).delete();
    }

    async deleteEntryById(id: string): Promise<void> {
        await this.table.delete(id);
    }

    async getEntriesByTimeRange(start: number, end: number): Promise<TagEntry[]> {
        return this.table
            .where("timestamp").between(start, end, true, true)
            .toArray();
    }

    async getAllEntries(): Promise<TagEntry[]> {
        return this.table.toArray();
    }

    async getEntriesUntilTimeAndLimit(untilTimestamp: number, limit: number): Promise<TagEntry[]> {
        return this.table
            .where("[timestamp+id]")
            .belowOrEqual([untilTimestamp, ""])
            .limit(limit)
            .reverse()
            .toArray();
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

    async getTagsByCategoryId(categoryId: string): Promise<Tag[]> {
        return this.table.where("categoryId").equals(categoryId).toArray();
    }

    async updateTags(tags: Tag[]): Promise<void> {
        await this.table.bulkPut(tags);
    }

    async count(): Promise<number> {
        return this.table.count();
    }

}

export class DexieTagCategoryCollection implements TagCategoryCollection {

    private table: EntityTable<TagCategory, "id">;

    constructor(table: EntityTable<TagCategory, "id">) {
        this.table = table;
    }

    async getCategories(): Promise<TagCategory[]> {
        return this.table.toArray();
    }

    async getCategoryById(categoryId: string): Promise<TagCategory | undefined> {
        return this.table.get(categoryId);
    }

    async createCategory(category: TagCategory): Promise<void> {
        await this.table.add(category);
    }

    async updateCategory(category: TagCategory): Promise<void> {
        await this.table.put(category);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        await this.table.where("id").equals(categoryId).delete();
    }

    async updateCategories(categories: TagCategory[]): Promise<void> {
        await this.table.bulkPut(categories);
    }

    async count(): Promise<number> {
        return this.table.count();
    }

}
