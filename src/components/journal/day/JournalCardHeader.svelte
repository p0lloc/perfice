<script lang="ts">
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import JournalEntryTimestamp from "@perfice/components/journal/day/JournalEntryTimestamp.svelte";
    import type {Snippet} from "svelte";
    import type {JournalEntry} from "@perfice/model/journal/journal";

    let {entry, children, onDelete}: { entry: JournalEntry, children: Snippet, onDelete: () => void } = $props();

    function onDeleteClick(e: MouseEvent) {
        e.stopPropagation();
        onDelete();
    }
</script>

<div class="w-full flex justify-between items-center overflow-hidden text-ellipsis">
    {@render children()}

    <div class="flex items-center gap-2">
        <button
                onclick={onDeleteClick}
                class="hidden md:group-hover:block hover:text-red-800"
        >
            <Fa icon={faTrash}/>
        </button>
        <div class="group-hover:hidden">
            <JournalEntryTimestamp timestamp={entry.timestamp} />
        </div>
    </div>
</div>
