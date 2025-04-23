<script lang="ts">
    import FilteredTagCategories from "@perfice/components/tag/FilteredTagCategories.svelte";
    import {onMount} from "svelte";
    import TagCard from "@perfice/components/tag/TagCard.svelte";
    import type {Tag} from "@perfice/model/tag/tag";
    import type {
        ReflectionTagsWidgetAnswerState,
        ReflectionTagsWidgetSettings
    } from "@perfice/model/reflection/widgets/tags";
    import {categorizedTags, tagCategories, tags} from "@perfice/stores";

    let {settings, state, onChange}: {
        settings: ReflectionTagsWidgetSettings,
        state: ReflectionTagsWidgetAnswerState,
        onChange: (state: ReflectionTagsWidgetAnswerState) => void
    } = $props();


    export function validate(): boolean {
        return true;
    }

    function onTagClicked(tag: Tag) {
        if (state.tags.includes(tag.id)) {
            onChange({...state, tags: state.tags.filter(t => t != tag.id)});
        } else {
            onChange({...state, tags: [...state.tags, tag.id]});
        }
    }

    onMount(() => {
        tagCategories.load();
        tags.load();
    });
</script>

{#await $categorizedTags}
    Loading...
{:then categories}
    <FilteredTagCategories categories={categories} visibleCategories={settings.categories}>
        {#snippet item(tag)}
            <TagCard {tag} checked={state.tags.includes(tag.id)} onClick={() => onTagClicked(tag)}/>
        {/snippet}
    </FilteredTagCategories>
{/await}