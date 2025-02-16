<script lang="ts">
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import {tagDate} from "@perfice/main";
    import TagCard from "@perfice/components/tag/TagCard.svelte";
    import {tags} from "@perfice/main";
    import {onMount} from "svelte";
    import type {Tag} from "@perfice/model/tag/tag";
    import {weekStart} from "@perfice/main";

    function onDateChange(e: Date) {
        $tagDate = e;
    }

    function newTag() {
        tags.createTag(prompt("Name") ?? "");
    }

    function onTagClicked(tag: Tag, entryToDelete: string | null) {
        if(entryToDelete == null) {
            tags.logTag(tag, $tagDate);
        } else {
            tags.unlogTagEntry(entryToDelete);
        }
    }

    onMount(() => {
        tags.load();
    })
</script>
<div class="mx-auto w-screen main-content md:w-1/2 md:px-0 px-4 md:py-10 py-2">
    <TitleAndCalendar date={$tagDate} onDateChange={onDateChange} title="Tags"/>

    <div class="flex flex-wrap gap-2">
        {#await $tags}
            Loading...
        {:then tags}
            {#each tags as tag(tag.id)}
                <TagCard tag={tag} onClick={(log) => onTagClicked(tag, log)} date={$tagDate} weekStart={$weekStart} />
            {/each}
        {/await}
        <button onclick={newTag}>+</button>
    </div>

</div>
