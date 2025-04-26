import type {DashboardWidgetCollection} from "@perfice/db/collections";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import {
    type DashboardWidget,
    type DashboardWidgetDisplaySettings,
    DashboardWidgetType,
    getDashboardWidgetDefinition
} from "@perfice/model/dashboard/dashboard";
import type {VariableService} from "@perfice/services/variable/variable";
import {updateDependencies} from "../variable/dependencies";

export class DashboardWidgetService {

    private collection: DashboardWidgetCollection;
    private observers: EntityObservers<DashboardWidget>;

    private variableService: VariableService;

    constructor(collection: DashboardWidgetCollection, variableService: VariableService) {
        this.collection = collection;
        this.observers = new EntityObservers();
        this.variableService = variableService;
    }

    async getWidgetsByDashboardId(dashboardId: string): Promise<DashboardWidget[]> {
        return this.collection.getWidgetsByDashboardId(dashboardId);
    }

    async getWidgetById(id: string): Promise<DashboardWidget | undefined> {
        return this.collection.getWidgetById(id);
    }

    async createWidget(dashboardId: string, type: DashboardWidgetType, display: DashboardWidgetDisplaySettings, customSettings?: any): Promise<DashboardWidget> {
        const definition = getDashboardWidgetDefinition(type)!;
        const settings = customSettings ?? definition.getDefaultSettings();

        const dependenciesMap = definition.createDependencies(settings);
        let storedDependencies: Record<string, string> = {};
        for (let [key, variable] of dependenciesMap.entries()) {
            await this.variableService.createVariable(variable);
            storedDependencies[key] = variable.id;
        }

        let widget: DashboardWidget = {
            id: crypto.randomUUID(),
            type,
            display,
            dashboardId,
            settings,
            dependencies: storedDependencies,
        };

        await this.collection.createWidget(widget);
        await this.observers.notifyObservers(EntityObserverType.CREATED, widget);

        return widget;
    }

    private async updateWidgetDependencies(previous: DashboardWidget, widget: DashboardWidget) {
        const definition = getDashboardWidgetDefinition(widget.type)!;
        const variableUpdates = definition.createDependencies(widget.settings, previous.dependencies);

        await updateDependencies(this.variableService, widget.dependencies, previous.dependencies, variableUpdates);
    }

    private async deleteWidgetDependencies(widget: DashboardWidget) {
        // Delete all dependencies of this widget
        for (let dependencyId of Object.values(widget.dependencies)) {
            await this.variableService.deleteVariableById(dependencyId);
        }
    }

    async updateWidget(widget: DashboardWidget, settingsUpdated: boolean): Promise<void> {
        const previous = await this.collection.getWidgetById(widget.id);
        if (previous == undefined) return;

        // Only update dependencies if the settings changed, not when widgets are moved etc
        if (settingsUpdated) {
            await this.updateWidgetDependencies(previous, widget);
        }

        await this.collection.updateWidget(widget);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, widget);
    }

    async deleteWidgetById(id: string): Promise<void> {
        let previous = await this.collection.getWidgetById(id);
        if (previous == undefined) return;

        await this.deleteWidgetDependencies(previous);
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