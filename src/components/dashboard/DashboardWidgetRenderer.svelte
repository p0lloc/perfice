<script lang="ts">
    import {type DashboardWidget, DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
    import type {Component} from "svelte";
    import DashboardEntryRowWidget from "@perfice/components/dashboard/types/entryRow/DashboardEntryRowWidget.svelte";
    import {editingDashboard, selectedWidget} from "@perfice/stores/dashboard/dashboard";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {widget, onClick, onDelete}: {
        widget: DashboardWidget,
        onClick: () => void,
        onDelete: () => void
    } = $props();

    const RENDERERS: Record<DashboardWidgetType, Component<{ settings: any }>> = {
        [DashboardWidgetType.ENTRY_ROW]: DashboardEntryRowWidget,
    };

    function onKeyDown(e: KeyboardEvent) {
        if (e.key != "Enter") return;

        onClick();
    }

    // noinspection JSUnusedGlobalSymbols Dynamically used in exports
    export function onWidgetUpdated(updated: DashboardWidget) {
        console.log("Updated", updated);
        widget = updated;
    }

    let RendererComponent = $derived(RENDERERS[widget.type]);
    let selected = $derived($selectedWidget?.id == widget.id);
</script>

<div onclick={onClick} class="w-full h-full bg-white widget-renderer text-left border-dashed"
     class:border-2={selected}
     onkeydown={onKeyDown}
     role="button"
     tabindex="0"
     data-widget-type={widget.type}>
    {#if selected}
        <div class="absolute right-3 top-3">
            <button onclick={onDelete} class="text-red-500 hover:text-red-700">
                <Fa icon={faTrash}/>
            </button>
        </div>
    {/if}
    <div class="w-full h-full" class:pointer-events-none={$editingDashboard}>
        <RendererComponent settings={widget.settings}/>
    </div>
</div>
