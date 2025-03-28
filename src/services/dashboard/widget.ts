import type {DashboardWidgetCollection} from "@perfice/db/collections";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import {
    type DashboardWidget,
    type DashboardWidgetDisplaySettings,
    DashboardWidgetType, getDashboardWidgetDefinition
} from "@perfice/model/dashboard/dashboard";
import type {VariableService} from "@perfice/services/variable/variable";

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

    async createWidget(dashboardId: string, type: DashboardWidgetType, display: DashboardWidgetDisplaySettings): Promise<DashboardWidget> {
        const definition = getDashboardWidgetDefinition(type)!;
        const settings = definition.getDefaultSettings();

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
        const variableUpdates = definition.updateDependencies(widget.dependencies, previous.settings, widget.settings);

        let previousDependencies = structuredClone(previous.dependencies);
        for (let [dependencyId, updatedType] of variableUpdates.entries()) {
            const variableId = widget.dependencies[dependencyId];
            if (variableId == undefined) {
                // Update returned a new variable, so we need to create it

                let newId = crypto.randomUUID();
                await this.variableService.createVariable({
                    id: newId,
                    name: "",
                    type: updatedType,
                })

                widget.dependencies[dependencyId] = newId;
                continue;
            }

            // Remove any dependencies that are still returned by the definition
            delete previousDependencies[dependencyId];

            const variable = this.variableService.getVariableById(variableId);
            if (variable == undefined) continue;

            variable.type = updatedType;
            await this.variableService.updateVariable(variable);
        }

        // Dependency is no longer returned by the definition, so we need to delete them
        for (let [_, variableId] of Object.entries(previousDependencies)) {
            await this.variableService.deleteVariableById(variableId);
        }

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