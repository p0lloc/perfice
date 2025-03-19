<script lang="ts">
    import type {DashboardTableWidgetEntry} from "@perfice/stores/dashboard/widget/table";

    let {entry}: { entry: DashboardTableWidgetEntry } = $props();
</script>

<div class="border-b w-full px-2 py-1 row-between">
    <p>
        {entry.prefix}
    </p>
    <p>{entry.suffix}</p>
</div>