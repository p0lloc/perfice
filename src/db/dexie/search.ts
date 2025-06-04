import type {SavedSearchCollection} from "../collections";
import type {JournalSearch} from "@perfice/model/journal/search/search";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieSavedSearchCollection implements SavedSearchCollection {

    private readonly table: SyncedTable<JournalSearch>;

    constructor(table: SyncedTable<JournalSearch>) {
        this.table = table;
    }

    async getSavedSearches(): Promise<JournalSearch[]> {
        return this.table.getAll();
    }

    async getSavedSearchById(id: string): Promise<JournalSearch | undefined> {
        return this.table.getById(id);
    }

    async putSavedSearch(search: JournalSearch): Promise<void> {
        await this.table.put(search);
    }

    async deleteSavedSearchById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }

}