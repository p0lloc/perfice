<script lang="ts">
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {type CategoryList, UNCATEGORIZED_NAME} from "@perfice/util/category";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import type {Tag, TagCategory} from "@perfice/model/tag/tag";
    import TagValueCard from "@perfice/components/tag/TagValueCard.svelte";
    import {tags} from "@perfice/app";

    let {category, date, weekStart, onTagClicked}: {
        category: CategoryList<TagCategory, Tag>,
        date: Date,
        weekStart: WeekStart,
        onTagClicked: (t: Tag, entryId: string | null) => void
    } = $props();

    async function createTag() {
        await tags.createTag(prompt("Name") ?? "", category.category?.id ?? null);
    }

</script>

<div>
    <h1 class="text-3xl flex justify-between">
        {category.category?.name ?? UNCATEGORIZED_NAME}
        <button onclick={createTag}>
            <Fa icon={faPlus}/>
        </button>
    </h1>
    <hr>
    <div
            class="w-full mt-4 flex flex-wrap gap-2 md:gap-2">
        {#each category.items as tag}
            <TagValueCard tag={tag} onClick={(log) => onTagClicked(tag, log)} date={date}
                          weekStart={weekStart}/>
        {/each}
    </div>
</div>
