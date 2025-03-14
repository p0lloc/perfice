import type {EntityTable} from "dexie";

export async function getEntitiesByOffsetAndLimit<T, K extends keyof T>(table: EntityTable<T, K>, page: number, pageSize: number): Promise<T[]> {
    let entries = await table
        .orderBy("timestamp")
        .reverse()
        .toArray();

    // TODO: quite inefficient to fetch all entries, according
    //  to https://dexie.org/docs/Collection/Collection.offset() we might be able to use something like "belowOrEqual"
    //  Using just "offset" is not working when ordering by timestamp

    let offset = page * pageSize;
    return entries.slice(offset, offset + pageSize);
}
