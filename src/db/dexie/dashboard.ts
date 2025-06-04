import type {DashboardCollection, DashboardWidgetCollection} from "@perfice/db/collections";
import type {Dashboard, DashboardWidget} from "@perfice/model/dashboard/dashboard";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieDashboardCollection implements DashboardCollection {

    private table: SyncedTable<Dashboard>;

    constructor(table: SyncedTable<Dashboard>) {
        this.table = table;
    }

    async getDashboards(): Promise<Dashboard[]> {
        return this.table.getAll();
    }

    async getDashboardById(id: string): Promise<Dashboard | undefined> {
        return this.table.getById(id);
    }

    async createDashboard(dashboard: Dashboard): Promise<void> {
        await this.table.put(dashboard);
    }

    async updateDashboard(dashboard: Dashboard): Promise<void> {
        await this.table.put(dashboard);
    }

    async deleteDashboardById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }

}

export class DexieDashboardWidgetCollection implements DashboardWidgetCollection {
    private table: SyncedTable<DashboardWidget>;

    constructor(table: SyncedTable<DashboardWidget>) {
        this.table = table;
    }

    async getWidgetsByDashboardId(dashboardId: string): Promise<DashboardWidget[]> {
        return this.table.where("dashboardId").equals(dashboardId).toArray();
    }

    async getWidgetById(id: string): Promise<DashboardWidget | undefined> {
        return this.table.getById(id);
    }

    async createWidget(widget: DashboardWidget): Promise<void> {
        await this.table.put(widget);
    }

    async updateWidget(widget: DashboardWidget): Promise<void> {
        await this.table.put(widget);
    }

    async deleteWidgetById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }
}