<script lang="ts">
    import {type DashboardWidget, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
    import {type Component} from "svelte";
    import DashboardEntryRowWidget from "@perfice/components/dashboard/types/entryRow/DashboardEntryRowWidget.svelte";
    import {editingDashboard, selectedWidget} from "@perfice/stores/dashboard/dashboard";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import DashboardChartWidget from "@perfice/components/dashboard/types/chart/DashboardChartWidget.svelte";
    import DashboardWelcomeWidget from "@perfice/components/dashboard/types/welcome/DashboardWelcomeWidget.svelte";
    import DashboardTableWidget from "@perfice/components/dashboard/types/table/DashboardTableWidget.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import DashboardTagsWidget from "@perfice/components/dashboard/types/tags/DashboardTagsWidget.svelte";
    import DashboardGoalWidget from "@perfice/components/dashboard/types/goal/DashboardGoalWidget.svelte";
    import DashboardMetricWidget from "@perfice/components/dashboard/types/metric/DashboardMetricWidget.svelte";
    import DashboardTrackableWidget
        from "@perfice/components/dashboard/types/trackable/DashboardTrackableWidget.svelte";
    import DashboardNewCorrelationsWidget
        from "@perfice/components/dashboard/types/newCorrelations/DashboardNewCorrelationsWidget.svelte";
    import DashboardInsightsWidget from "@perfice/components/dashboard/types/insights/DashboardInsightsWidget.svelte";
    import DashboardChecklistWidget
        from "@perfice/components/dashboard/types/checkList/DashboardChecklistWidget.svelte";

    let {widget, onClick, onDelete, openFormModal}: {
        widget: DashboardWidget,
        openFormModal: (formId: string, answers?: Record<string, PrimitiveValue>) => void,
        onClick: (widget: DashboardWidget) => void,
        onDelete: (widget: DashboardWidget) => void
    } = $props();

    const RENDERERS: Record<DashboardWidgetType, Component<{
        settings: any,
        dependencies: Record<string, string>,
        openFormModal: (formId: string, answers?: Record<string, PrimitiveValue>) => void,
        widgetId: string,
    }>> = {
        [DashboardWidgetType.ENTRY_ROW]: DashboardEntryRowWidget,
        [DashboardWidgetType.CHART]: DashboardChartWidget,
        [DashboardWidgetType.WELCOME]: DashboardWelcomeWidget,
        [DashboardWidgetType.TABLE]: DashboardTableWidget,
        [DashboardWidgetType.GOAL]: DashboardGoalWidget,
        [DashboardWidgetType.TAGS]: DashboardTagsWidget,
        [DashboardWidgetType.METRIC]: DashboardMetricWidget,
        [DashboardWidgetType.TRACKABLE]: DashboardTrackableWidget,
        [DashboardWidgetType.NEW_CORRELATIONS]: DashboardNewCorrelationsWidget,
        [DashboardWidgetType.INSIGHTS]: DashboardInsightsWidget,
        [DashboardWidgetType.CHECKLIST]: DashboardChecklistWidget,
    };

    function onClicked() {
        onClick(widget);
    }

    function onDeleteClicked() {
        onDelete(widget);
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.key != "Enter") return;

        onClicked();
    }

    // noinspection JSUnusedGlobalSymbols Dynamically used in exports
    export function onWidgetUpdated(updated: DashboardWidget) {
        widget = updated;
    }

    let RendererComponent = $derived(RENDERERS[widget.type]);
    let selected = $derived($selectedWidget?.id == widget.id);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex Only clickable if the dashboard is in edit mode -->
<div onclick={onClicked} class="widget-renderer text-left grid-stack-item-content"
     onkeydown={onKeyDown}
     role={$editingDashboard ? "button" : ""}
     tabindex="0"
     data-widget-type={widget.type}>
    {#if selected}
        <!-- Dummy container for border -->
        <div class="w-full h-full absolute border-2 border-green-500 border-dashed pointer-events-none"></div>
        <!-- Delete button -->
        <div class="absolute right-2 px-2 pt-1 rounded-t-md top-[-25px] bg-white border-t border-x z-[100]">
            <button onclick={onDeleteClicked} class="text-red-500 hover:text-red-700">
                <Fa icon={faTrash}/>
            </button>
        </div>
    {/if}
    <div class="w-full h-full" class:pointer-events-none={$editingDashboard}>
        <RendererComponent settings={widget.settings}
                           dependencies={widget.dependencies} widgetId={widget.id} {openFormModal}/>
    </div>
</div>
