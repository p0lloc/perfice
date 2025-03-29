<script lang="ts">
    import type {DashboardTagsWidgetSettings} from "@perfice/model/dashboard/widgets/tags";
    import {categorizedTags, tagCategories, tags, weekStart} from "@perfice/app";
    import {onMount} from "svelte";
    import {UNCATEGORIZED_NAME} from "@perfice/util/category";
    import TagValueCard from "@perfice/components/tag/TagValueCard.svelte";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import {faTags} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {type Tag, UNCATEGORIZED_TAG_CATEGORY_ID} from "@perfice/model/tag/tag";
    import FilteredTagCategories from "@perfice/components/tag/FilteredTagCategories.svelte";

    let {settings}: {
        settings: DashboardTagsWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    function onTagClicked(tag: Tag, entryToDelete: string | null) {
        if (entryToDelete == null) {
            tags.logTag(tag.id, $dashboardDate);
        } else {
            tags.unlogTagEntry(entryToDelete);
        }
    }

    onMount(() => {
        tagCategories.load();
        tags.load();
    });
</script>
<div class="bg-white w-full h-full rounded-xl border overflow-x-scroll scrollbar-hide">
    {#await $categorizedTags}
        Loading...
    {:then categories}
        <div class="border-b basic self-stretch p-2 font-bold text-gray-600 row-between">
            <div class="row-gap">
                <Fa icon={faTags} class="text-green-500"/>
                <span>Tags</span>
            </div>
        </div>
        <div class="p-2">
            <FilteredTagCategories categories={categories} visibleCategories={settings.categories}>
                {#snippet item(tag)}
                    <TagValueCard {tag} date={$dashboardDate} weekStart={$weekStart}
                                  onClick={(e) => onTagClicked(tag, e)}/>
                {/snippet}
            </FilteredTagCategories>
        </div>
    {/await}
</div>
