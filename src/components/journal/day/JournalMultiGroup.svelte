<script lang="ts">
    import type {JournalDayGroup} from "@perfice/stores/journal/grouped";
    import JournalCardBase from "@perfice/components/journal/day/JournalCardBase.svelte";
    import JournalCardHeader from "@perfice/components/journal/day/JournalCardHeader.svelte";
    import {faStar} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {JournalEntry} from "@perfice/model/journal/journal";

    let {group, onEntryClick, onEntryDelete}: {
        group: JournalDayGroup,
        onEntryClick: (entry: JournalEntry) => void,
        onEntryDelete: (entry: JournalEntry) => void
    } = $props();
</script>

<div>
    <h2 class="text-2xl font-bold mb-2 flex gap-2 items-center text-gray-600">
        <Fa icon={faStar}/>
        {group.name}
    </h2>
    <div class="flex gap-2 flex-col">
        {#each group.entries as entry (entry.id)}
            <JournalCardBase
                    onClick={() => onEntryClick(entry)}
            >
                <JournalCardHeader {entry} onDelete={() => onEntryDelete(entry)}>
                    <p class="text-ellipsis overflow-hidden">ok</p>
                </JournalCardHeader>
            </JournalCardBase>
        {/each}
    </div>
</div>
