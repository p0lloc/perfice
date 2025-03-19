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

    let {widget, onClick, onDelete, openFormModal}: {
        widget: DashboardWidget,
        openFormModal: (formId: string, answers?: Record<string, PrimitiveValue>) => void,
        onClick: (widget: DashboardWidget) => void,
        onDelete: (widget: DashboardWidget) => void
    } = $props();

    const RENDERERS: Record<DashboardWidgetType, Component<{
        settings: any,
        dependencies: Record<string, string>,
        openFormModal: (formId: string, answers?: Record<string, PrimitiveValue>) => void
    }>> = {
        [DashboardWidgetType.ENTRY_ROW]: DashboardEntryRowWidget,
        [DashboardWidgetType.CHART]: DashboardChartWidget,
        [DashboardWidgetType.WELCOME]: DashboardWelcomeWidget,
        [DashboardWidgetType.TABLE]: DashboardTableWidget,
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
<div onclick={onClicked} class="w-full h-full bg-white widget-renderer text-left"
     onkeydown={onKeyDown}
     role={$editingDashboard ? "button" : ""}
     tabindex="0"
     data-widget-type={widget.type}>
    {#if selected}
        <!-- Dummy container for border -->
        <div class="w-full h-full absolute border-2 border-green-500 border-dashed pointer-events-none"></div>
        <!-- Delete button -->
        <div class="absolute right-2 px-2 pt-1 rounded-t-md top-[-25px] bg-white border-t border-x z-10">
            <button onclick={onDeleteClicked} class="text-red-500 hover:text-red-700">
                <Fa icon={faTrash}/>
            </button>
        </div>
    {/if}
    <div class="w-full h-full" class:pointer-events-none={$editingDashboard}>
        <RendererComponent settings={widget.settings} dependencies={widget.dependencies} {openFormModal}/>
    </div>
</div>
