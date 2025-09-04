<script lang="ts">
    import type {DashboardTagsWidgetSettings} from "@perfice/model/dashboard/widgets/tags";
    import type {Form} from "@perfice/model/form/form";
    import MultiSelectDropdownButton from "@perfice/components/base/dropdown/MultiSelectDropdownButton.svelte";
    import {UNCATEGORIZED_TAG_CATEGORY_ID} from "@perfice/model/tag/tag";
    import {UNCATEGORIZED_NAME} from "@perfice/util/category";
    import {tagCategories} from "@perfice/stores";

    let {settings, onChange, forms}: {
        settings: DashboardTagsWidgetSettings,
        onChange: (settings: DashboardTagsWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
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
