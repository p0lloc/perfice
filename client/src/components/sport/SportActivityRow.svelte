<script lang="ts">
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {formatTimestampHHMM} from "@perfice/util/time/format";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

    let {entry, trackable, durationFormatted}: {
        entry: JournalEntry;
        trackable: Trackable | undefined;
        durationFormatted: string;
    } = $props();
</script>

<div class="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <div class="w-9 h-9 flex-shrink-0">
        {#if trackable}
            <Icon name={trackable.icon} class="text-xl"/>
        {:else}
            <div class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        {/if}
    </div>

    <div class="flex-1 min-w-0">
        <span class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate block">
            {trackable?.name ?? "Unknown"}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
            {formatTimestampHHMM(entry.timestamp)}
        </span>
    </div>

    <div class="text-right flex-shrink-0">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {durationFormatted}
        </span>
    </div>
</div>
