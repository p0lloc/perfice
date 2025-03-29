<script lang="ts">
    import {type CategoryList, UNCATEGORIZED_NAME} from "@perfice/util/category";
    import {type Tag, type TagCategory, UNCATEGORIZED_TAG_CATEGORY_ID} from "@perfice/model/tag/tag";
    import type {Snippet} from "svelte";

    let {categories, visibleCategories, item}: {
        categories: CategoryList<TagCategory, Tag>[],
        visibleCategories: string[],
        item: Snippet<[Tag]>
    } = $props();
</script>
<div class="flex flex-col gap-2">
    {#each categories as category (category.category?.id)}
        {#if visibleCategories.length === 0 || visibleCategories.includes(category.category?.id ?? UNCATEGORIZED_TAG_CATEGORY_ID)}
            <div>
                <p class="font-bold text-gray-600 text-lg mb-1">{category.category?.name ?? UNCATEGORIZED_NAME}</p>
                <div class="flex flex-wrap gap-1">
                    {#each category.items as tag}
                        {@render item(tag)}
                    {/each}
                </div>
            </div>
        {/if}
    {/each}
</div>
