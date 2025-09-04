<script lang="ts">
    import type {Form} from "@perfice/model/form/form";
    import type {
        DashboardChecklistWidgetSettings
    } from "@perfice/model/dashboard/widgets/checklist";
    import EditChecklistWidgetSettings
        from "@perfice/components/sharedWidgets/checklist/EditChecklistWidgetSettings.svelte";

    let {settings, onChange, forms}: {
        settings: DashboardChecklistWidgetSettings,
        onChange: (settings: DashboardChecklistWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();
</script>

<EditChecklistWidgetSettings {settings} {onChange} {forms}/>