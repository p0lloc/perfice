<script lang="ts">
    import type {DashboardEditWidgetAction} from "@perfice/model/dashboard/ui";
    import {DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
    import EditEntryRowWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/EditEntryRowWidgetSidebar.svelte";
    import type {Component} from "svelte";
    import type {Form} from "@perfice/model/form/form";

    let {action}: { action: DashboardEditWidgetAction } = $props();

    const RENDERERS: Record<DashboardWidgetType, Component<{
        settings: any,
        onChange: (settings: any) => void,
        forms: Form[]
    }>> = {
        [DashboardWidgetType.ENTRY_ROW]: EditEntryRowWidgetSidebar
    };

    function onSettingsChange(settings: any) {
        action.widget = {...action.widget, settings};
        action.onChange(action.widget);
    }

    const RendererComponent = $derived(RENDERERS[action.widget.type]);
</script>

<RendererComponent
        settings={action.widget.settings}
        onChange={onSettingsChange}
        forms={action.forms}/>
