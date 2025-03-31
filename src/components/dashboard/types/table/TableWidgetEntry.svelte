<script lang="ts">
    import type {TableWidgetEntry} from "@perfice/stores/sharedWidgets/table/table";

    let {entry}: { entry: TableWidgetEntry } = $props();
</script>

<div class="w-full px-2 py-1 row-between [&:not(:last-child)]:border-b">
    <p>
        {entry.prefix}
    </p>
    <p>{entry.suffix}</p>
</div>