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

export const editingDashboard = writable(true);
export const dashboardDate = writable(dateToMidnight(new Date()));
export const selectedWidget: Writable<DashboardWidget | undefined> = writable(undefined);

export class DashboardStore extends AsyncStore<Dashboard[]> {

    private dashboardService: DashboardService;

    constructor(dashboardService: DashboardService) {
        super(resolvedPromise([]));
        this.dashboardService = dashboardService;
    }

    async load() {
        this.set(this.dashboardService.getDashboards());
    }

}

export class DashboardWidgetStore extends AsyncStore<DashboardWidget[]> {

    private dashboardWidgetService: DashboardWidgetService;

    constructor(dashboardWidgetService: DashboardWidgetService) {
        super(emptyPromise());
        this.dashboardWidgetService = dashboardWidgetService;
    }

    async load(dashboardId: string) {
        this.set(this.dashboardWidgetService.getWidgetsByDashboardId(dashboardId));
    }

    async updateWidget(widget: DashboardWidget) {
        await this.dashboardWidgetService.updateWidget(widget);
    }

    async deleteWidgetById(id: string) {
        await this.dashboardWidgetService.deleteWidgetById(id);
    }

    async createWidget(dashboardId: string, widgetType: DashboardWidgetType, display: DashboardWidgetDisplaySettings): Promise<DashboardWidget> {
        return this.dashboardWidgetService.createWidget(dashboardId, widgetType, display);
    }
}