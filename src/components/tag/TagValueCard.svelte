<script lang="ts">
    import TagButtonBase from "@perfice/components/tag/TagButtonBase.svelte";
    import type {Tag} from "@perfice/model/tag/tag";
    import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {tagValue} from "@perfice/app";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import TagCard from "@perfice/components/tag/TagCard.svelte";

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

