<script lang="ts">
    import type {DashboardEditWidgetAction} from "@perfice/model/dashboard/ui";
    import {DashboardWidgetType} from "@perfice/model/dashboard/dashboard";
    import EditEntryRowWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/entryRow/EditEntryRowWidgetSidebar.svelte";
    import type {Component} from "svelte";
    import type {Form} from "@perfice/model/form/form";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import EditChartWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/chart/EditChartWidgetSidebar.svelte";
    import EditTableWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/table/EditTableWidgetSidebar.svelte";
    import EditWelcomeWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/welcome/EditWelcomeWidgetSidebar.svelte";
    import EditGoalWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/goal/EditGoalWidgetSidebar.svelte";
    import EditTagsWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/tags/EditTagsWidgetSidebar.svelte";
    import EditMetricWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/metric/EditMetricWidgetSidebar.svelte";
    import EditTrackableWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/trackable/EditTrackableWidgetSidebar.svelte";
    import EditInsightsWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/insights/EditInsightsWidgetSidebar.svelte";
    import EditChecklistWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/checklist/EditChecklistWidgetSidebar.svelte";
    import EditNewCorrelationsWidgetSidebar
        from "@perfice/components/dashboard/sidebar/edit/types/newCorrelations/EditNewCorrelationsWidgetSidebar.svelte";

    let {action}: { action: DashboardEditWidgetAction } = $props();

    const RENDERERS: Record<DashboardWidgetType, Component<{
        settings: any,
        onChange: (settings: any) => void,
        forms: Form[],
        dependencies: Record<string, string>
    }>> = {
        [DashboardWidgetType.ENTRY_ROW]: EditEntryRowWidgetSidebar,
        [DashboardWidgetType.CHART]: EditChartWidgetSidebar,
        [DashboardWidgetType.TABLE]: EditTableWidgetSidebar,
        [DashboardWidgetType.WELCOME]: EditWelcomeWidgetSidebar,
        [DashboardWidgetType.GOAL]: EditGoalWidgetSidebar,
        [DashboardWidgetType.TAGS]: EditTagsWidgetSidebar,
        [DashboardWidgetType.METRIC]: EditMetricWidgetSidebar,
        [DashboardWidgetType.TRACKABLE]: EditTrackableWidgetSidebar,
        [DashboardWidgetType.INSIGHTS]: EditInsightsWidgetSidebar,
        [DashboardWidgetType.NEW_CORRELATIONS]: EditNewCorrelationsWidgetSidebar,
        [DashboardWidgetType.CHECKLIST]: EditChecklistWidgetSidebar,
    };

    function onSettingsChange(settings: any) {
        action.widget = {...action.widget, settings};
        action.onChange(action.widget);
    }

    const RendererComponent = $derived(RENDERERS[action.widget.type]);
</script>

<RendererComponent
        settings={action.widget.settings}
        dependencies={action.widget.dependencies}
        onChange={onSettingsChange}
        forms={action.forms}/>

<Button onClick={action.onDelete} color={ButtonColor.RED} class="block w-full mt-8">Delete widget</Button>
