<script lang="ts">
    import type {DashboardEditWidgetAction} from "@perfice/model/dashboard/ui";
    import {DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
    import EditEntryRowWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/EditEntryRowWidgetSidebar.svelte";
    import type {Component} from "svelte";

    let {action}: { action: DashboardEditWidgetAction } = $props();

    const RENDERERS: Record<DashboardWidgetType, Component<{ settings: any, onChange: (settings: any) => void }>> = {
        [DashboardWidgetType.ENTRY_ROW]: EditEntryRowWidgetSidebar
    };

    function onSettingsChange(settings: any) {
        action.onChange({...action.widget, settings});
    }

    const RendererComponent = $derived(RENDERERS[action.widget.type]);
</script>

<RendererComponent settings={action.widget.settings} onChange={onSettingsChange}/>
