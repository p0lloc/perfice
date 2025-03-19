<script lang="ts">
    import type {DashboardEditWidgetAction} from "@perfice/model/dashboard/ui";
    import {DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
    import EditEntryRowWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/EditEntryRowWidgetSidebar.svelte";
    import type {Component} from "svelte";
    import type {Form} from "@perfice/model/form/form";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import EditChartWidgetSidebar from "@perfice/components/dashboard/sidebar/edit/types/EditChartWidgetSidebar.svelte";
    import EditTableWidgetSidebar from "@perfice/components/dashboard/sidebar/edit/types/EditTableWidgetSidebar.svelte";
    import EditWelcomeWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/EditWelcomeWidgetSidebar.svelte";

    let {action}: { action: DashboardEditWidgetAction } = $props();

    const RENDERERS: Record<DashboardWidgetType, Component<{
        settings: any,
        onChange: (settings: any) => void,
        forms: Form[]
    }>> = {
        [DashboardWidgetType.ENTRY_ROW]: EditEntryRowWidgetSidebar,
        [DashboardWidgetType.CHART]: EditChartWidgetSidebar,
        [DashboardWidgetType.TABLE]: EditTableWidgetSidebar,
        [DashboardWidgetType.WELCOME]: EditWelcomeWidgetSidebar,
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

<Button onClick={action.onDelete} color={ButtonColor.RED} class="md:hidden block w-full mt-8">Delete</Button>
