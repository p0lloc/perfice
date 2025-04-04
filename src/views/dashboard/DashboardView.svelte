<script lang="ts">
    import GridstackGrid from "@perfice/components/dashboard/GridstackGrid.svelte";
    import {dashboards, dashboardWidgets, forms} from "@perfice/app";
    import {
        type DashboardWidget,
        type DashboardWidgetDisplaySettings,
        DashboardWidgetType
    } from "@perfice/model/dashboard/dashboard";
    import {dashboardDate, editingDashboard, selectedWidget} from "@perfice/stores/dashboard/dashboard";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import DashboardSidebar from "@perfice/components/dashboard/DashboardSidebar.svelte";
    import {
        DashboardSidebarActionType,
        dropdownButtonsForDashboards,
        popupButtonsForDashboards
    } from "@perfice/model/dashboard/ui";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import {dateToMidnight, dateWithCurrentTime} from "@perfice/util/time/simple";
    import CalendarScroll from "@perfice/components/base/calendarScroll/CalendarScroll.svelte";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {faCheck, faChevronDown, faPen, faPlus} from "@fortawesome/free-solid-svg-icons";
    import {get} from "svelte/store";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";

    let currentDashboard = $state(window.localStorage.getItem("currentDashboard") ?? "test");

    let deleteWidgetModal: GenericDeleteModal<DashboardWidget>;
    let grid: GridstackGrid;
    let sidebar: DashboardSidebar;

    let formModal: FormModal;

    dashboards.load();
    dashboardWidgets.load(currentDashboard);

    async function openFormModal(formId: string, answers?: Record<string, PrimitiveValue>) {
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
            answers
        );
    }

    async function onDashboardChange(dashboardId: string) {
        console.log(dashboardId)
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
                    onWidgetUpdate($state.snapshot(v), true)
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

    async function onWidgetUpdate(widget: DashboardWidget, settingsUpdated: boolean) {
        await dashboardWidgets.updateWidget(widget, settingsUpdated);
        grid.updateWidget(widget);
    }

    // Reset state when we visit the page
    dashboardDate.set(dateToMidnight(new Date()));
    selectedWidget.set(undefined);
    editingDashboard.set(false);
</script>

<GenericDeleteModal subject="this widget" onDelete={onWidgetDelete} bind:this={deleteWidgetModal}/>
<FormModal bind:this={formModal}/>

<MobileTopBar title="Dashboard">
    {#snippet actions()}
        {#await $dashboards then values}
            {#if !$editingDashboard}
                <PopupIconButton icon={faChevronDown}
                                 buttons={popupButtonsForDashboards(values, (v) => onDashboardChange(v))}/>
            {/if}
        {/await}
        <IconButton icon={$editingDashboard ? faCheck : faPen} onClick={() => $editingDashboard = !$editingDashboard}/>
        {#if $editingDashboard}
            <IconButton icon={faPlus} onClick={openAddWidgetSidebar}/>
        {/if}
    {/snippet}
</MobileTopBar>

<div class="flex-1 h-screen overflow-y-scroll scrollbar-hide md:w-auto w-screen pb-32 px-2">
    <div class="flex md:justify-end justify-center">
        <div class="row-gap p-2 flex-wrap flex-1 md:flex-initial">
            <CalendarScroll value={$dashboardDate} onChange={(v) => $dashboardDate = v}/>
            <input type="checkbox" class="hidden md:block" bind:checked={$editingDashboard}>
            <button onclick={openAddWidgetSidebar} class="hidden md:block">+</button>
            {#await $dashboards then values}
                <BindableDropdownButton
                        class="min-w-64 hidden md:flex"
                        value={currentDashboard}
                        onChange={onDashboardChange}
                        items={dropdownButtonsForDashboards(values)}/>
            {/await}
        </div>
    </div>

    <!-- Click event only for dismissing sidebar when clicking on the background -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="w-full" onclick={onBackgroundClick}>
        {#await $dashboardWidgets then widgets}
            <GridstackGrid {openFormModal} bind:this={grid} {onWidgetAdd} onWidgetDelete={onWidgetStartDelete}
                           onWidgetUpdate={(widget) => onWidgetUpdate(widget, false)}
                           {onWidgetSelect}
                           {widgets} edit={$editingDashboard}/>
        {/await}
    </div>
</div>
<DashboardSidebar onClose={onSidebarClosed} bind:this={sidebar}/>