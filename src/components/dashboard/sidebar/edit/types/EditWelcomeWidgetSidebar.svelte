<script lang="ts">
    import type {DashboardWelcomeWidgetSettings} from "@perfice/model/dashboard/widgets/welcome";
    import type {Form} from "@perfice/model/form/form";

    let {settings, onChange, forms}: {
        settings: DashboardWelcomeWidgetSettings,
        onChange: (settings: DashboardWelcomeWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();
</script>