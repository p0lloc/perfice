<script lang="ts">
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import {tagCategories, tagDate} from "@perfice/main";
    import {tags} from "@perfice/main";
    import {onMount} from "svelte";
    import type {Tag} from "@perfice/model/tag/tag";
    import {weekStart, categorizedTags} from "@perfice/main";
    import TagCategoryContainer from "@perfice/components/tag/TagCategoryContainer.svelte";
    import LineButton from "@perfice/components/base/button/LineButton.svelte";

    function onDateChange(e: Date) {
        $tagDate = e;
    }

    function onTagClicked(tag: Tag, entryToDelete: string | null) {
        if (entryToDelete == null) {
            tags.logTag(tag, $tagDate);
        } else {
            tags.unlogTagEntry(entryToDelete);
        }
    }

    function addCategory() {
        tagCategories.createCategory(prompt("Name") ?? "");
    }

    onMount(() => {
        tags.load();
    })
</script>
<div class="mx-auto w-screen main-content md:w-1/2 md:px-0 px-4 md:py-10 py-2">
    <TitleAndCalendar date={$tagDate} onDateChange={onDateChange} title="Tags"/>

    <div class="flex flex-col gap-8">
        {#await $categorizedTags}
            Loading...
        {:then categories}
            {#each categories as category (category.category?.id)}
                <TagCategoryContainer date={$tagDate} category={category} weekStart={$weekStart}
                                      onTagClicked={(t, entryId) => onTagClicked(t, entryId)}/>
            {/each}
            <LineButton onClick={addCategory}/>
        {/await}
    </div>
</div>
