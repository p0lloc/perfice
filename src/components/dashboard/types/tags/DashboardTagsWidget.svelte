<script lang="ts">
    import type {DashboardTagsWidgetSettings} from "@perfice/model/dashboard/widgets/tags";

    let {settings}: {
        settings: DashboardTagsWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();
</script>

tags