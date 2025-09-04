<script lang="ts">
    import {UNCATEGORIZED_TAG_CATEGORY_ID} from "@perfice/model/tag/tag";
    import {UNCATEGORIZED_NAME} from "@perfice/util/category";
    import MultiSelectDropdownButton from "@perfice/components/base/dropdown/MultiSelectDropdownButton.svelte";
    import type {ReflectionTagsWidgetSettings} from "@perfice/model/reflection/widgets/tags";
    import {tagCategories} from "@perfice/stores";

    let {settings, onChange}: {
        settings: ReflectionTagsWidgetSettings,
        onChange: (settings: ReflectionTagsWidgetSettings) => void
    } = $props();

    let availableCategories = $derived.by(async () => [
        {value: UNCATEGORIZED_TAG_CATEGORY_ID, name: UNCATEGORIZED_NAME},
        ...(await tagCategories.fetchCategories()).map(v => {
            return {value: v.id, name: v.name}
        })]);
</script>

<p class="text-lg font-bold">Categories</p>
<p class="text-sm">Select which categories to show</p>

{#await availableCategories then val}
    <MultiSelectDropdownButton class="w-full mt-2" value={settings.categories} items={val}
                               onChange={(v) => onChange({...settings, categories: v})}/>
{/await}
