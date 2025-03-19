<script lang="ts">
    import type {DashboardWelcomeWidgetSettings} from "@perfice/model/dashboard/widgets/welcome";

    let {settings}: {
        settings: DashboardWelcomeWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();
</script>

<div class="p-6 w-full h-full box-border bg-gradient-to-r from-green-500 to-green-600 rounded-md shadow-md text-white">
    <h2 class="text-3xl font-bold">Good morning!</h2>
</div>
