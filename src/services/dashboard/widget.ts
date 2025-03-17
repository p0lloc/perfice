import type {DashboardCollection, DashboardWidgetCollection} from "@perfice/db/collections";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import {
    type DashboardWidget,
    type DashboardWidgetDisplaySettings,
    DashboardWidgetType, getDashboardWidgetDefinition
} from "@perfice/model/dashboard/dashboard";

export class DashboardWidgetService {

    private collection: DashboardWidgetCollection;
    private observers: EntityObservers<DashboardWidget>;

    constructor(collection: DashboardWidgetCollection) {
        this.collection = collection;
        this.observers = new EntityObservers();
    }

    async getWidgetsByDashboardId(dashboardId: string): Promise<DashboardWidget[]> {
        return this.collection.getWidgetsByDashboardId(dashboardId);
    }

    async getWidgetById(id: string): Promise<DashboardWidget | undefined> {
        return this.collection.getWidgetById(id);
    }

    async createWidget(dashboardId: string, type: DashboardWidgetType, display: DashboardWidgetDisplaySettings): Promise<DashboardWidget> {
        const definition = getDashboardWidgetDefinition(type)!;
        let widget: DashboardWidget = {
            id: crypto.randomUUID(),
            type,
            display,
            dashboardId,
            settings: definition.getDefaultSettings()
        };

        await this.collection.createWidget(widget);
        await this.observers.notifyObservers(EntityObserverType.CREATED, widget);

        return widget;
    }

    async updateWidget(widget: DashboardWidget): Promise<void> {
        await this.collection.updateWidget(widget);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, widget);
    }

    async deleteWidgetById(id: string): Promise<void> {
        let previous = await this.collection.getWidgetById(id);
        if (previous == undefined) return;

        await this.collection.deleteWidgetById(id);
        await this.observers.notifyObservers(EntityObserverType.DELETED, previous);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<DashboardWidget>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<DashboardWidget>) {
        this.observers.removeObserver(type, callback);
    }

}