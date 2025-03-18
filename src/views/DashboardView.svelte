<script lang="ts">
    import GridstackGrid from "@perfice/components/dashboard/GridstackGrid.svelte";
    import {dashboards, dashboardWidgets, forms} from "@perfice/main";
    import {
        type DashboardWidget,
        type DashboardWidgetDisplaySettings,
        DashboardWidgetType
    } from "@perfice/model/dashboard/dashboard";
    import {dashboardDate, editingDashboard, selectedWidget} from "@perfice/stores/dashboard/dashboard";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import DashboardSidebar from "@perfice/components/dashboard/DashboardSidebar.svelte";
    import {DashboardSidebarActionType} from "@perfice/model/dashboard/ui";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import {dateWithCurrentTime} from "@perfice/util/time/simple";
    import CalendarScroll from "@perfice/components/base/calendarScroll/CalendarScroll.svelte";

    let currentDashboard = $state("test");

    let deleteWidgetModal: GenericDeleteModal<DashboardWidget>;
    let grid: GridstackGrid;
    let sidebar: DashboardSidebar;

    let formModal: FormModal;

    dashboards.load();
    dashboardWidgets.load(currentDashboard);

    async function openFormModal(formId: string) {
        // TODO: streamline form opening process?
        let form = await forms.getFormById(formId);
        let templates = await forms.getTemplatesByFormId(formId);
        if (form == undefined) return;

        formModal.open(
            form,
            form.questions,
            form.format,
            dateWithCurrentTime($dashboardDate),
            templates,
        );
    }

    function onWidgetAdd(widgetType: DashboardWidgetType, display: DashboardWidgetDisplaySettings) {
        return dashboardWidgets.createWidget(currentDashboard, widgetType, display);
    }

    function onWidgetStartDelete(widget: DashboardWidget) {
        deleteWidgetModal.open(widget);
    }

    function onWidgetDelete(widget: DashboardWidget) {
        grid.removeWidget(widget);
        dashboardWidgets.deleteWidgetById(widget.id);
        unselectWidget();
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

    function onBackgroundClick(e: MouseEvent) {
        if ((e.target as HTMLElement).classList.contains("widget-renderer")) return;

        unselectWidget();
    }

    function unselectWidget() {
        $selectedWidget = undefined;
        sidebar.close();
    }

    function onSidebarClosed() {
        $selectedWidget = undefined;
    }

    async function onWidgetUpdate(widget: DashboardWidget) {
        await dashboardWidgets.updateWidget(widget);
        grid.updateWidget(widget);
    }
</script>

<GenericDeleteModal subject="widget" onDelete={onWidgetDelete} bind:this={deleteWidgetModal}/>
<FormModal bind:this={formModal}/>

<div class="flex-1 h-screen overflow-y-scroll scrollbar-hide md:w-auto w-screen pb-32 px-2">
    <div class="flex justify-end">
        <div class="row-gap p-2">
            <CalendarScroll value={$dashboardDate} onChange={(v) => $dashboardDate = v}/>
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

    <!-- Click event only for dismissing sidebar when clicking on the background -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="w-full" onclick={onBackgroundClick}>
        {#await $dashboardWidgets then widgets}
            <GridstackGrid {openFormModal} bind:this={grid} {onWidgetAdd} onWidgetDelete={onWidgetStartDelete}
                           {onWidgetUpdate}
                           {onWidgetSelect}
                           {widgets} edit={$editingDashboard}/>
        {/await}
    </div>
</div>
<DashboardSidebar onClose={onSidebarClosed} bind:this={sidebar}/>