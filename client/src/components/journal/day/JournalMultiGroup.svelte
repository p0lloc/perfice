<script lang="ts">
    import type {JournalDayGroup} from "@perfice/stores/journal/grouped";
    import JournalCardBase from "@perfice/components/journal/day/JournalCardBase.svelte";
    import JournalCardHeader from "@perfice/components/journal/day/JournalCardHeader.svelte";
    import type {JournalEntity, JournalEntry} from "@perfice/model/journal/journal";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

    let {
        group, onEntryClick, onEntryDelete,

        selectedEntities
    }: {
        group: JournalDayGroup,
        onEntryClick: (entry: JournalEntry) => void,
        onEntryDelete: (entry: JournalEntry) => void,
        selectedEntities: JournalEntity[]
    } = $props();
</script>

<div>
    <h2 class="text-2xl font-bold mb-2 flex gap-1 items-center text-gray-600">
        <Icon name={group.icon} class="text-green-500 text-3xl"/>
        {group.name}
    </h2>
    <div class="flex gap-2 flex-col">
        {#each group.entries as entry (entry.id)}
            <JournalCardBase
                    selected={selectedEntities.some(e => e.entry.id === entry.id)}
                    onClick={() => onEntryClick(entry)}
            >
                <JournalCardHeader {entry} onDelete={() => onEntryDelete(entry)}>
                    <p class="text-ellipsis overflow-hidden">{entry.displayValue}</p>
                </JournalCardHeader>
            </JournalCardBase>
        {/each}
    </div>
</div>
