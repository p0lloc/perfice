import type {DashboardCollection} from "@perfice/db/collections";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {Dashboard} from "@perfice/model/dashboard/dashboard";
import type {Form} from "@perfice/model/form/form";

export class DashboardService {

    private collection: DashboardCollection;
    private observers: EntityObservers<Dashboard>;

    constructor(collection: DashboardCollection) {
        this.collection = collection;
        this.observers = new EntityObservers();
    }

    async getDashboards(): Promise<Dashboard[]> {
        return this.collection.getDashboards();
    }

    async getDashboardById(id: string): Promise<Dashboard | undefined> {
        return this.collection.getDashboardById(id);
    }

    async createDashboard(name: string): Promise<Dashboard> {
        let dashboard = {
            id: crypto.randomUUID(),
            name,
        };

        await this.collection.createDashboard(dashboard);
        await this.observers.notifyObservers(EntityObserverType.CREATED, dashboard);
        return dashboard;
    }

    async updateDashboard(dashboard: Dashboard): Promise<void> {
        await this.collection.updateDashboard(dashboard);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, dashboard);
    }

    async deleteDashboardById(id: string): Promise<void> {
        let previous = await this.collection.getDashboardById(id);
        if (previous == undefined) return;

        await this.collection.deleteDashboardById(id);
        await this.observers.notifyObservers(EntityObserverType.DELETED, previous);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Dashboard>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Dashboard>) {
        this.observers.removeObserver(type, callback);
    }

}