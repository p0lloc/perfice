<script lang="ts">
    import EditTableWidgetSettings from "@perfice/components/sharedWidgets/table/EditTableWidgetSettings.svelte";
    import type {TableWidgetSettings} from "@perfice/model/sharedWidgets/table/table.js";
    import type {Form} from "@perfice/model/form/form.js";
    import type {DashboardTableWidgetSettings} from "@perfice/model/dashboard/widgets/table";

    let {settings, onChange, forms}: {
        settings: DashboardTableWidgetSettings,
        onChange: (settings: DashboardTableWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();
</script>

<EditTableWidgetSettings {settings} {onChange} {forms}/>