import type {EntityTable} from "dexie";
import type {DashboardCollection} from "@perfice/db/collections";
import type {Dashboard, DashboardWidget} from "@perfice/model/dashboard/dashboard";

export class DexieDashboardCollection implements DashboardCollection {

    private table: EntityTable<Dashboard, "id">;

    constructor(table: EntityTable<Dashboard, "id">) {
        this.table = table;
    }

    async getDashboards(): Promise<Dashboard[]> {
        return this.table.toArray();
    }

    async getDashboardById(id: string): Promise<Dashboard | undefined> {
        return this.table.get(id);
    }

    async createDashboard(dashboard: Dashboard): Promise<void> {
        await this.table.add(dashboard);
    }

    async updateDashboard(dashboard: Dashboard): Promise<void> {
        await this.table.put(dashboard);
    }

    async deleteDashboardById(id: string): Promise<void> {
        await this.table.delete(id);
    }

}

export class DexieDashboardWidgetCollection {
    private table: EntityTable<DashboardWidget, "id">;

    constructor(table: EntityTable<DashboardWidget, "id">) {
        this.table = table;
    }

    async getWidgetsByDashboardId(dashboardId: string): Promise<DashboardWidget[]> {
        return this.table.where("dashboardId").equals(dashboardId).toArray();
    }

    async getWidgetById(id: string): Promise<DashboardWidget | undefined> {
        return this.table.get(id);
    }

    async createWidget(widget: DashboardWidget): Promise<void> {
        await this.table.add(widget);
    }

    async updateWidget(widget: DashboardWidget): Promise<void> {
        await this.table.put(widget);
    }

    async deleteWidgetById(id: string): Promise<void> {
        await this.table.delete(id);
    }
}