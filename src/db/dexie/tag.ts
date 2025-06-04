import type {TagEntry} from "@perfice/model/journal/journal";
import type {Tag, TagCategory} from "@perfice/model/tag/tag";
import type {TagCategoryCollection, TagCollection, TagEntryCollection,} from "@perfice/db/collections";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieTagEntryCollection implements TagEntryCollection {

    private readonly table: SyncedTable<TagEntry>;

    constructor(table: SyncedTable<TagEntry>) {
        this.table = table;
    }

    async getEntryById(entryId: string): Promise<TagEntry | undefined> {
        return this.table.getById(entryId);
    }

    async createEntry(entry: TagEntry): Promise<void> {
        await this.table.put(entry);
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
        let byTag = await this.table.where("tagId").equals(tagId).toArray();
        await this.table.deleteByIds(byTag.map(e => e.id));
    }

    async deleteEntryById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }

    async getEntriesByTimeRange(start: number, end: number): Promise<TagEntry[]> {
        return this.table
            .where("timestamp").between(start, end, true, true)
            .toArray();
    }

    async getAllEntries(): Promise<TagEntry[]> {
        return this.table.getAll();
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

    private table: SyncedTable<Tag>;

    constructor(table: SyncedTable<Tag>) {
        this.table = table;
    }

    getTags(): Promise<Tag[]> {
        return this.table.getAll();
    }

    async getTagById(id: string): Promise<Tag | undefined> {
        return this.table.getById(id);
    }

    async createTag(tag: Tag): Promise<void> {
        await this.table.put(tag);
    }

    async updateTag(tag: Tag): Promise<void> {
        await this.table.put(tag);
    }

    async deleteTagById(id: string): Promise<void> {
        await this.table.deleteById(id);
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

    private table: SyncedTable<TagCategory>;

    constructor(table: SyncedTable<TagCategory>) {
        this.table = table;
    }

    async getCategories(): Promise<TagCategory[]> {
        return this.table.getAll();
    }

    async getCategoryById(categoryId: string): Promise<TagCategory | undefined> {
        return this.table.getById(categoryId);
    }

    async createCategory(category: TagCategory): Promise<void> {
        await this.table.put(category);
    }

    async updateCategory(category: TagCategory): Promise<void> {
        await this.table.put(category);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        await this.table.deleteById(categoryId);
    }

    async updateCategories(categories: TagCategory[]): Promise<void> {
        await this.table.bulkPut(categories);
    }

    async count(): Promise<number> {
        return this.table.count();
    }

}
