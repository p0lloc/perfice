<script lang="ts" generics="C, T">
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import CategoryContainerHeader from "@perfice/components/base/category/CategoryContainerHeader.svelte";
    import type {CategoryList} from "@perfice/util/category";
    import type {Snippet} from "svelte";

    let {
        category, class: className = "", onCategoryDelete,
        onEntityCreate, getName,
        onReorder, entity,
        extraClass = "",
        actions,
        extra
    }: {
        category: CategoryList<C, T>,
        onEntityCreate: () => void,
        onCategoryDelete: () => void,
        getName: (t: C) => string,
        onReorder: (items: T[]) => void
        entity: Snippet<[T]>,
        extra?: Snippet,
        actions?: Snippet,
        class?: string
        extraClass?: string
    } = $props();
</script>

<div class="group">
    <CategoryContainerHeader {category} {onCategoryDelete} {onEntityCreate} {getName} {actions}/>
    <hr>
    <div class="{extraClass} mt-4">
        <DragAndDropContainer items={category.items} onFinalize={onReorder}
                              class={className}>
            {#snippet item(e)}
                {@render entity(e)}
            {/snippet}
            <!--{#snippet item(trackable)}-->
            <!--    <TrackableCard {trackable} {date} {weekStart} onEdit={() => onEdit(trackable)}-->
            <!--                   onLog={() => onLog(trackable)}/>-->
            <!--{/snippet}-->
        </DragAndDropContainer>
        {@render extra?.()}
    </div>
</div>
