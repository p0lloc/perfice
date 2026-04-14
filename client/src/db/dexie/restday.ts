import type {RestDayCollection} from "@perfice/db/collections";
import type {RestDay} from "@perfice/model/sport/restday";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieRestDayCollection implements RestDayCollection {

    private table: SyncedTable<RestDay>;

    constructor(table: SyncedTable<RestDay>) {
        this.table = table;
    }

    async getRestDays(): Promise<RestDay[]> {
        return this.table.getAll();
    }

    async getRestDayByDate(date: string): Promise<RestDay | undefined> {
        return this.table.where("date").equals(date).first();
    }

    async getRestDaysByDateRange(startDate: string, endDate: string): Promise<RestDay[]> {
        return this.table.where("date").between(startDate, endDate, true, true).toArray();
    }

    async createRestDay(restDay: RestDay): Promise<void> {
        await this.table.create(restDay);
    }

    async deleteRestDayByDate(date: string): Promise<void> {
        let restDay = await this.getRestDayByDate(date);
        if (restDay) {
            await this.table.deleteById(restDay.id);
        }
    }

    async deleteRestDayById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }
}
