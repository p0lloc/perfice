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
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import {get} from "svelte/store";

    let currentDashboard = $state(window.localStorage.getItem("currentDashboard") ?? "test");

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

    async function onDashboardChange(dashboardId: string) {
        if (dashboardId == "create") {
            let dashboard = await dashboards.createDashboard(prompt("Name") ?? "");
            currentDashboard = dashboard.id;
            return;
        }

        currentDashboard = dashboardId;
        await dashboardWidgets.load(currentDashboard);
        window.localStorage.setItem("currentDashboard", currentDashboard);
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

    async function onWidgetSelect(widget: DashboardWidget) {
        if (!$editingDashboard) return;

        $selectedWidget = widget;
        sidebar.open({
            type: DashboardSidebarActionType.EDIT_WIDGET,
            value: {
                widget,
                forms: await $forms,
                onChange: (v: DashboardWidget) => {
                    onWidgetUpdate($state.snapshot(v))
                },
                onDelete: () => {
                    sidebar.close();
                    onWidgetStartDelete(widget)
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

    async function findBottommostWidget(): Promise<DashboardWidgetDisplaySettings> {
        let items = await get(dashboardWidgets);

        let x = 0;
        let maxY = 0;
        for (let item of items) {
            let end = item.display.y + item.display.height;
            if (end > maxY) {
                maxY = end;
                x = item.display.x;
            }
        }

        return {
            x: x,
            y: maxY + 1,
            width: 3,
            height: 3
        };
    }

    function openAddWidgetSidebar() {
        sidebar.open({
            type: DashboardSidebarActionType.ADD_WIDGET, value: {
                onClick: async (type: DashboardWidgetType) => {
                    let display = await findBottommostWidget();
                    let widget = await dashboardWidgets.createWidget(currentDashboard, type, display);

                    grid.addWidget(widget);
                    sidebar.close();
                }
            }
        });
    }

    async function onWidgetUpdate(widget: DashboardWidget) {
        await dashboardWidgets.updateWidget(widget);
        grid.updateWidget(widget);
    }
</script>

<GenericDeleteModal subject="this widget" onDelete={onWidgetDelete} bind:this={deleteWidgetModal}/>
<FormModal bind:this={formModal}/>

<div class="flex-1 h-screen overflow-y-scroll scrollbar-hide md:w-auto w-screen pb-32 px-2">
    <div class="flex justify-end">
        <div class="row-gap p-2 flex-wrap">
            <CalendarScroll value={$dashboardDate} onChange={(v) => $dashboardDate = v}/>
            <input type="checkbox" bind:checked={$editingDashboard}>
            <button onclick={openAddWidgetSidebar}>+</button>
            {#await $dashboards then values}
                <BindableDropdownButton
                        class="min-w-64"
                        value={currentDashboard}
                        onChange={onDashboardChange}
                        items={
                [...values.map(v => {
                    return {value: v.id, name: v.name}
                }), {value: "create", name: "Create new", icon: faPlus, separated: true}]}/>
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