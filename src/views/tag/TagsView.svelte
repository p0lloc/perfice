<script lang="ts">
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import {tagCategories, tagDate} from "@perfice/app";
    import {tags} from "@perfice/app";
    import {onMount} from "svelte";
    import type {Tag} from "@perfice/model/tag/tag";
    import {weekStart, categorizedTags} from "@perfice/app";
    import TagCategoryContainer from "@perfice/components/tag/TagCategoryContainer.svelte";
    import LineButton from "@perfice/components/base/button/LineButton.svelte";
    import {faTags} from "@fortawesome/free-solid-svg-icons";
    import {dateToMidnight} from "@perfice/util/time/simple";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";

    function onDateChange(e: Date) {
        $tagDate = e;
    }

    function onTagClicked(tag: Tag, entryToDelete: string | null) {
        if (entryToDelete == null) {
            tags.logTag(tag.id, $tagDate);
        } else {
            tags.unlogTagEntry(entryToDelete);
        }
    }

    function addCategory() {
        tagCategories.createCategory(prompt("Name") ?? "");
    }

    onMount(() => {
        tagCategories.load();
        tags.load();
    });

    tagDate.set(dateToMidnight(new Date()));
</script>

<MobileTopBar title="Tags"/>
<div class="mx-auto w-screen main-content md:w-1/2 md:px-0 px-4 md:py-10 py-2">
    <TitleAndCalendar
            date={$tagDate}
            {onDateChange}
            title="Tags"
            icon={faTags}
    />

    <div class="flex flex-col gap-8">
        {#await $categorizedTags}
            Loading...
        {:then categories}
            {#each categories as category (category.category?.id)}
                <TagCategoryContainer
                        date={$tagDate}
                        {category}
                        weekStart={$weekStart}
                        onTagClicked={(t, entryId) => onTagClicked(t, entryId)}
                />
            {/each}
            <LineButton onClick={addCategory}/>
        {/await}
    </div>
</div>
