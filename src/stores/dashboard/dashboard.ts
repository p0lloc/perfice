import {AsyncStore} from "@perfice/stores/store";
import {
    type Dashboard,
    type DashboardWidget,
    type DashboardWidgetDisplaySettings,
    DashboardWidgetType
} from "@perfice/model/dashboard/dashboard";
import type {DashboardService} from "@perfice/services/dashboard/dashboard";
import {emptyPromise, resolvedPromise} from "@perfice/util/promise";
import type {DashboardWidgetService} from "@perfice/services/dashboard/widget";
import {writable, type Writable} from "svelte/store";
import {dateToMidnight} from "@perfice/util/time/simple";
import {EntityObserverType} from "@perfice/services/observer";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";

export const editingDashboard = writable(false);
export const dashboardDate = writable(dateToMidnight(new Date()));
export const selectedWidget: Writable<DashboardWidget | undefined> = writable(undefined);

export class DashboardStore extends AsyncStore<Dashboard[]> {

    private dashboardService: DashboardService;

    constructor(dashboardService: DashboardService) {
        super(resolvedPromise([]));
        this.dashboardService = dashboardService;
        this.dashboardService.addObserver(EntityObserverType.CREATED,
            async (e: Dashboard) => await this.onDashboardCreated(e));
    }

    async load() {
        this.set(this.dashboardService.getDashboards());
    }

    async createDashboard(prompt: string): Promise<Dashboard> {
        return this.dashboardService.createDashboard(prompt);
    }

    async onDashboardCreated(dashboard: Dashboard) {
        this.updateResolved(v => [...v, dashboard]);
    }
}

export class DashboardWidgetStore extends AsyncStore<DashboardWidget[]> {

    private dashboardWidgetService: DashboardWidgetService;

    constructor(dashboardWidgetService: DashboardWidgetService) {
        super(emptyPromise());
        this.dashboardWidgetService = dashboardWidgetService;
        this.dashboardWidgetService.addObserver(EntityObserverType.CREATED,
            async (e: DashboardWidget) => await this.onWidgetCreated(e));
        this.dashboardWidgetService.addObserver(EntityObserverType.UPDATED,
            async (e: DashboardWidget) => await this.onWidgetUpdated(e));
        this.dashboardWidgetService.addObserver(EntityObserverType.DELETED,
            async (e: DashboardWidget) => await this.onWidgetDeleted(e));
    }

    async load(dashboardId: string) {
        this.set(this.dashboardWidgetService.getWidgetsByDashboardId(dashboardId));
    }

    async updateWidget(widget: DashboardWidget, settingsUpdated: boolean) {
        await this.dashboardWidgetService.updateWidget(widget, settingsUpdated);
    }

    async deleteWidgetById(id: string) {
        await this.dashboardWidgetService.deleteWidgetById(id);
    }

    async createWidget(dashboardId: string, widgetType: DashboardWidgetType, display: DashboardWidgetDisplaySettings): Promise<DashboardWidget> {
        return this.dashboardWidgetService.createWidget(dashboardId, widgetType, display);
    }

    async onWidgetCreated(widget: DashboardWidget) {
        this.updateResolved(v => [...v, widget]);
    }

    async onWidgetUpdated(widget: DashboardWidget) {
        this.updateResolved(v => updateIdentifiedInArray(v, widget));
    }

    async onWidgetDeleted(widget: DashboardWidget) {
        this.updateResolved(v => deleteIdentifiedInArray(v, widget.id));
    }

}