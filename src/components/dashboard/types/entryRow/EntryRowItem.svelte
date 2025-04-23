<script lang="ts">
    import type {EntryRowWidgetEntry} from "@perfice/stores/dashboard/widget/entryRow";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import {formatTimestampHHMM} from "@perfice/util/time/format";

    let {entry}: { entry: EntryRowWidgetEntry } = $props();
</script>

<div class="p-2 flex flex-col items-center">
    {#if entry.icon}
        <Icon name={entry.value} class="text-2xl"/>
    {:else}
        {entry.value}
    {/if}
    <span class="text-gray-400 text-sm">{formatTimestampHHMM(entry.timestamp)}</span>
</div>
