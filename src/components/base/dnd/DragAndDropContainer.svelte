<script lang="ts">
    import {type DndEvent, dndzone, dragHandleZone, SOURCES, TRIGGERS} from "svelte-dnd-action";
    import {longPress} from "@perfice/util/long-press";
    import type {Snippet} from "svelte";

    let {items = $bindable(), item, class: className = '', disabled = false, onFinalize, zoneId = "dnd", dragHandles = false}: {
        items: any[],
        item: Snippet<[any, number]>,
        class?: string,
        dragHandles?: boolean,
        disabled?: boolean,
        zoneId?: string,

        onFinalize: (items: any[]) => void
    } = $props();

    let dragDisabled = $state(true);
    //let currentItems = $state(items);


    function onConsider(e: CustomEvent<DndEvent>) {
        items = e.detail.items;

        if (e.detail.info.source === SOURCES.KEYBOARD && e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
            dragDisabled = true;
            document.body.classList.remove("lock-screen");
        }
    }

    function onFinalized(e: CustomEvent<DndEvent>) {
        items = e.detail.items;
        onFinalize($state.snapshot(e.detail.items));

        if (e.detail.info.source === SOURCES.POINTER) {
            dragDisabled = true;
            document.body.classList.remove("lock-screen");
        }
    }

    function onLongPress() {
        dragDisabled = false;
    }

    function transformDraggedElement(el?: HTMLElement) {
        if (el == null) return;
        // Sometimes the element inherits the background color, but when we drag it we don't want any transparency
        el.style.backgroundColor = "white";
    }

    /**
     * Invalidates the current items and uses the passed in items instead.
     */
    export function invalidateItems() {
        //items = items;
    }

    let settings = $derived({
        type: zoneId,
        items,
        dragDisabled: dragDisabled || disabled,
        dropTargetStyle: {},
        morphDisabled: true,
        transformDraggedElement
    });
</script>

{#snippet loop(items)}
    {#each items as trackable, i (trackable.id)}
        <div use:longPress onlong={onLongPress}>
            {@render item(trackable, i)}
        </div>
    {/each}
{/snippet}

{#if dragHandles}
    <div
            use:dragHandleZone={settings}
            onconsider={onConsider}
            onfinalize={onFinalized}
            class="{className}">
        {@render loop(items)}
    </div>
{:else}
    <div
            use:dndzone={settings}
            onconsider={onConsider}
            onfinalize={onFinalized}
            class="{className}">
        {@render loop(items)}
    </div>
{/if}
