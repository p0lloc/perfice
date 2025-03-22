<script lang="ts">
    import TagButtonBase from "@perfice/components/tag/TagButtonBase.svelte";
    import type {Tag} from "@perfice/model/tag/tag";
    import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {tagValue} from "@perfice/app";
    import type {WeekStart} from "@perfice/model/variable/time/time";

    let {tag, date, weekStart, onClick}: {
        tag: Tag,
        date: Date,
        weekStart: WeekStart,
        onClick: (entryId: string | null) => void
    } = $props();

    let tagEntry = $derived(tagValue(tag, date, weekStart, tag.id));
</script>

<!-- This should always be resolved since we have a default value in the variable store -->
{#await $tagEntry then entryId}
    <TagButtonBase checked={entryId != null} onClick={() => onClick(entryId)}>
        <span class="text-ellipsis overflow-hidden">{tag.name}</span>
        <span class="w-2">
            {#if entryId != null}
            <Fa icon={faTimes}/>
        {:else}
            <Fa icon={faPlus}/>
        {/if}
        </span>
    </TagButtonBase>
{/await}

