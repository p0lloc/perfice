<script lang="ts">
    import type {Form} from "@perfice/model/form/form";
    import type {DashboardNewCorrelationsWidgetSettings} from "@perfice/model/dashboard/widgets/newCorrelations";

    let {settings, onChange, forms}: {
        settings: DashboardNewCorrelationsWidgetSettings,
        onChange: (settings: DashboardNewCorrelationsWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();
</script>
