import type {EncryptionKey} from "@perfice/model/sync/sync";
import type {EntityTable} from "dexie";
import type {EncryptionKeyCollection} from "@perfice/db/collections";

const AUTH_KEY_ID = 'main';

export class DexieEncryptionKeyCollection implements EncryptionKeyCollection {
    private table: EntityTable<EncryptionKey, 'id'>;

    constructor(table: EntityTable<EncryptionKey, 'id'>) {
        this.table = table;
    }

    async getKey(): Promise<CryptoKey | null> {
        const key = await this.table.get(AUTH_KEY_ID);
        return key?.key ?? null;
    }

    async put(key: CryptoKey): Promise<void> {
        await this.table.put({id: AUTH_KEY_ID, key});
    }

}
