<script lang="ts">
    import JournalCardHeader from "@perfice/components/journal/day/JournalCardHeader.svelte";
    import JournalCardBase from "@perfice/components/journal/day/JournalCardBase.svelte";
    import type {JournalDayGroup} from "@perfice/stores/journal/grouped";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faStar} from "@fortawesome/free-solid-svg-icons";
    import type {JournalEntry} from "@perfice/model/journal/journal";

    let {group, onEntryClick, onEntryDelete}: {
        group: JournalDayGroup,
        onEntryClick: (entry: JournalEntry) => void,
        onEntryDelete: (entry: JournalEntry) => void
    } = $props();
</script>

{#each group.entries as entry}
    <JournalCardBase onClick={() =>  onEntryClick(entry)}>
        <div class="flex items-center gap-4">
            <p class="text-2xl">
                <Fa icon={faStar}/>
            </p>
            <div class="flex-1 w-[60%]">
                <JournalCardHeader {entry} onDelete={() => onEntryDelete(entry)}>
                    <h2 class="text-xl font-bold">
                        {entry.name}
                    </h2>
                </JournalCardHeader>
                <p
                        class="overflow-hidden text-ellipsis w-full text-left"
                        style="text-wrap: nowrap"
                >
                    ok
                </p>
            </div>
        </div>
    </JournalCardBase>
{/each}
