<script lang="ts">
    import GridstackGrid from "@perfice/components/dashboard/GridstackGrid.svelte";
    import {dashboards, dashboardWidgets} from "@perfice/main";
    import {
        type DashboardWidget,
        type DashboardWidgetDisplaySettings,
        DashboardWidgetType
    } from "@perfice/model/dashboard/dashboard";
    import {editingDashboard, selectedWidget} from "@perfice/stores/dashboard/dashboard";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import DashboardSidebar from "@perfice/components/dashboard/DashboardSidebar.svelte";
    import {DashboardSidebarActionType} from "@perfice/model/dashboard/ui";

    let currentDashboard = $state("test");

    let deleteWidgetModal: GenericDeleteModal<DashboardWidget>;
    let grid: GridstackGrid;
    let sidebar: DashboardSidebar;

    dashboards.load();
    dashboardWidgets.load(currentDashboard);

    function onWidgetAdd(widgetType: DashboardWidgetType, display: DashboardWidgetDisplaySettings) {
        return dashboardWidgets.createWidget(currentDashboard, widgetType, display);
    }

    function onWidgetStartDelete(widget: DashboardWidget) {
        deleteWidgetModal.open(widget);
    }

    function onWidgetDelete(widget: DashboardWidget) {
        grid.removeWidget(widget);
        dashboardWidgets.deleteWidgetById(widget.id);
    }

    function onWidgetSelect(widget: DashboardWidget) {
        if (!$editingDashboard) return;

        $selectedWidget = widget;
        sidebar.open({
            type: DashboardSidebarActionType.EDIT_WIDGET,
            value: {
                widget, onChange: (v: DashboardWidget) => {
                    onWidgetUpdate($state.snapshot(v))
                }
            }
        });
    }

    function onWidgetUpdate(widget: DashboardWidget) {
        dashboardWidgets.updateWidget(widget);
        grid.updateWidget(widget);
    }
</script>

<GenericDeleteModal subject="widget" onDelete={onWidgetDelete} bind:this={deleteWidgetModal}/>
<div class="flex-1">
    <div class="flex justify-end">
        <div class="row-gap p-2">
            <input type="checkbox" bind:checked={$editingDashboard}>
            <button onclick={() => sidebar.open({type: DashboardSidebarActionType.ADD_WIDGET, value: {}})}>+</button>
            {#await $dashboards then values}
                <select>
                    {#each values as dashboard}
                        <option value={dashboard.id}>{dashboard.name}</option>
                    {/each}
                </select>
            {/await}
        </div>
    </div>
    {#await $dashboardWidgets then widgets}
        <GridstackGrid bind:this={grid} {onWidgetAdd} onWidgetDelete={onWidgetStartDelete} {onWidgetUpdate}
                       {onWidgetSelect}
                       {widgets} edit={$editingDashboard}/>
    {/await}
</div>
<DashboardSidebar bind:this={sidebar}/>