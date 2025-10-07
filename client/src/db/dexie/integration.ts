import type {Integration} from "@perfice/model/integration/integration";
import type {LocalIntegrationCollection} from "@perfice/db/collections";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieLocalIntegrationCollection implements LocalIntegrationCollection {

    private readonly table: SyncedTable<Integration>;

    constructor(table: SyncedTable<Integration>) {
        this.table = table;
    }

    getIntegrations(): Promise<Integration[]> {
        return this.table.getAll();
    }

    getIntegrationById(id: string): Promise<Integration | undefined> {
        return this.table.getById(id);
    }

    createIntegration(integration: Integration): Promise<void> {
        return this.table.create(integration);
    }

    updateIntegration(integration: Integration): Promise<void> {
        return this.table.put(integration);
    }

    deleteIntegrationById(id: string): Promise<void> {
        return this.table.deleteById(id);
    }

    async deleteIntegrationsByFormId(formId: string): Promise<void> {
        let integrationsByFormId = await this.table.where("formId").equals(formId).toArray();
        return this.table.deleteByIds(integrationsByFormId.map(i => i.id));
    }

}