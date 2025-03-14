<script lang="ts">
    import TagButtonBase from "@perfice/components/tag/TagButtonBase.svelte";
    import type {TransformedTagEntry} from "@perfice/stores/journal/grouped";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faTimes} from "@fortawesome/free-solid-svg-icons";
    import type {JournalEntity, TagEntry} from "@perfice/model/journal/journal";

    let {tagEntries, onClick, selectedEntities}: {
        tagEntries: TransformedTagEntry[],
        onClick: (entry: TagEntry) => void,
        selectedEntities: JournalEntity[]
    } = $props();
</script>

{#if tagEntries.length > 0}
    <div class="flex gap-2 flex-wrap">
        {#each tagEntries as entry (entry.id)}
            <TagButtonBase checked={selectedEntities.some(e => e.entry.id === entry.id)}
                           onClick={() => onClick(entry)}>
                {entry.tag.name}
                <Fa icon={faTimes}/>
            </TagButtonBase>
        {/each}
    </div>
{/if}
