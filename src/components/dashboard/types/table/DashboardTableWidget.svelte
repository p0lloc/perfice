<script lang="ts">
    import type {DashboardTableWidgetSettings} from "@perfice/model/dashboard/widgets/table";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import TableWidget from "@perfice/components/sharedWidgets/table/TableWidget.svelte";

    let {dependencies, openFormModal, settings}: {
        settings: DashboardTableWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string, answers?: Record<string, PrimitiveValue>) => void
    } = $props();
</script>

<TableWidget {settings} date={$dashboardDate} {openFormModal} listVariableId={dependencies["list"]}/>
