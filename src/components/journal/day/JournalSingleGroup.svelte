<script lang="ts">
    import JournalCardHeader from "@perfice/components/journal/day/JournalCardHeader.svelte";
    import JournalCardBase from "@perfice/components/journal/day/JournalCardBase.svelte";
    import type {JournalDayGroup} from "@perfice/stores/journal/grouped";
    // noinspection ES6UnusedImports
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

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
                <Icon name={group.icon} class="text-green-500"/>
            </p>
            <div class="flex-1 w-[60%]">
                <JournalCardHeader {entry} onDelete={() => onEntryDelete(entry)}>
                    <h2 class="text-xl font-bold text-gray-600">
                        {entry.name}
                    </h2>
                </JournalCardHeader>
                <p
                        class="overflow-hidden text-ellipsis w-full text-left"
                        style="text-wrap: nowrap"
                >
                    {entry.displayValue}
                </p>
            </div>
        </div>
    </JournalCardBase>
{/each}
