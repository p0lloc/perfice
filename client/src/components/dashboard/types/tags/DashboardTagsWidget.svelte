<script lang="ts">
    import type {DashboardTagsWidgetSettings} from "@perfice/model/dashboard/widgets/tags";
    import {onMount} from "svelte";
    import TagValueCard from "@perfice/components/tag/TagValueCard.svelte";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import {faTags} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {type Tag} from "@perfice/model/tag/tag";
    import FilteredTagCategories from "@perfice/components/tag/FilteredTagCategories.svelte";
    import {categorizedTags, tagCategories, tags, weekStart} from "@perfice/stores";
    import DashboardWidgetBase from "@perfice/components/dashboard/DashboardWidgetBase.svelte";

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
{#await $categorizedTags}
    <DashboardWidgetBase>
        <div class="p-4">
            Loading...
        </div>
    </DashboardWidgetBase>
{:then categories}
    <DashboardWidgetBase title="Tags" icon={faTags}>
        <div class="p-2">
            <FilteredTagCategories categories={categories} visibleCategories={settings.categories}>
                {#snippet item(tag)}
                    <TagValueCard {tag} date={$dashboardDate} weekStart={$weekStart}
                                  onClick={(e) => onTagClicked(tag, e)}/>
                {/snippet}
            </FilteredTagCategories>
        </div>
    </DashboardWidgetBase>
{/await}
