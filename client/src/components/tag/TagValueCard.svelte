<script lang="ts">
    import type {Tag} from "@perfice/model/tag/tag";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import TagCard from "@perfice/components/tag/TagCard.svelte";
    import {tagValue} from "@perfice/stores";

    let {tag, date, weekStart, onClick, editing = false}: {
        tag: Tag,
        date: Date,
        weekStart: WeekStart,
        editing?: boolean,
        onClick: (entryId: string | null) => void
    } = $props();

    let tagEntry = $derived(tagValue(tag, date, weekStart, tag.id));
</script>

<!-- This should always be resolved since we have a default value in the variable store -->
{#await $tagEntry then entryId}
    <TagCard {tag} {editing} checked={entryId != null} onClick={() => onClick(entryId)}/>
{/await}

