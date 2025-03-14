<script lang="ts">
    import TagButtonBase from "@perfice/components/tag/TagButtonBase.svelte";
    import type {TransformedTagEntry} from "@perfice/stores/journal/grouped";

    let {tagEntries}: { tagEntries: TransformedTagEntry[] } = $props();
</script>

{#if tagEntries.length > 0}
    <div class="flex gap-2 flex-wrap">
        {#each tagEntries as entry (entry.id)}
            <TagButtonBase checked={true} onClick={() => {}}>
                {entry.tag.name}
            </TagButtonBase>
        {/each}
    </div>
{/if}
