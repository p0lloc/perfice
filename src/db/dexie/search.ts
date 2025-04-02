import type {SavedSearchCollection} from "../collections";
import type {JournalSearch} from "@perfice/model/journal/search/search";
import type {EntityTable} from "dexie";

export class DexieSavedSearchCollection implements SavedSearchCollection {

    private readonly table: EntityTable<JournalSearch, "id">;

    constructor(table: EntityTable<JournalSearch, "id">) {
        this.table = table;
    }

    async getSavedSearches(): Promise<JournalSearch[]> {
        return this.table.toArray();
    }

    async getSavedSearchById(id: string): Promise<JournalSearch | undefined> {
        return this.table.get(id);
    }

    async putSavedSearch(search: JournalSearch): Promise<void> {
        await this.table.put(search);
    }

    async deleteSavedSearchById(id: string): Promise<void> {
        await this.table.delete(id);
    }

}