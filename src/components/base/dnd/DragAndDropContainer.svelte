<script lang="ts">
    import {type DndEvent, dndzone, SOURCES, TRIGGERS} from "svelte-dnd-action";
    import {longPress} from "@perfice/util/long-press";
    import type {Snippet} from "svelte";

    let {items, item, class: className = '', disabled = false, onFinalize}: {
        items: any[],
        item: Snippet<[any]>,
        class?: string,
        disabled?: boolean,

        onFinalize: (items: any[]) => void
    } = $props();

    let dragDisabled = $state(true);
    let currentItems = $state(items);


    function onConsider(e: CustomEvent<DndEvent>) {
        currentItems = e.detail.items;

        if(e.detail.info.source === SOURCES.KEYBOARD && e.detail.info.trigger === TRIGGERS.DRAG_STOPPED){
            dragDisabled = true;
            document.body.classList.remove("lock-screen");
        }
    }

    function onFinalized(e: CustomEvent<DndEvent>) {
        currentItems = e.detail.items;
        onFinalize($state.snapshot(e.detail.items));

        if (e.detail.info.source === SOURCES.POINTER) {
            dragDisabled = true;
            document.body.classList.remove("lock-screen");
        }
    }

    function onLongPress() {
        dragDisabled = false;
    }

    /**
     * Invalidates the current items and uses the passed in items instead.
     */
    export function invalidateItems(){
        currentItems = items;
    }
</script>

<div
        use:dndzone="{{items: currentItems, dragDisabled: dragDisabled || disabled, dropTargetStyle: {}}}" onconsider={onConsider}
        onfinalize={onFinalized}
        class="{className}">
    {#each currentItems as trackable (trackable.id)}
        <div use:longPress onlong={onLongPress}>
            {@render item(trackable)}
        </div>
    {/each}
</div>
