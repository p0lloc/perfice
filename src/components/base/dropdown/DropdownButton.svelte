<script lang="ts" generics="T">
    import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";

    let contextMenu: ContextMenu;
    let button: HTMLButtonElement;
    let {value, items, class: className = '', onChange}: {
        value: T,
        items: DropdownMenuItem<T>[],
        class?: string,
        onChange: (v: T) => void
    } = $props();

    function open(e: MouseEvent) {
        contextMenu.openFromClick(e, button, true);
    }

    function onAction(e: DropdownMenuItem<T>) {
        e.action?.();
        onChange(e.value);
    }

    let selectedItem: DropdownMenuItem<T> | undefined = $derived(items.find(i => i.value == value));
</script>
<button class="border min-h-8 min-w-16 rounded-xl px-3 py-2 flex items-center justify-between {className} gap-2 context-menu-button"
        onclick={open} bind:this={button}>
    <div class="row-gap pointer-events-none">
        {#if selectedItem != null}
            {#if selectedItem.icon != null}
                <Fa icon={selectedItem.icon} class="w-4"/>
            {/if}
            {selectedItem.name}
        {:else}
            <span class="text-gray-500">Select value</span>
        {/if}
    </div>
    <Fa icon={faChevronDown} class="text-xs pointer-events-none"/>
</button>

<ContextMenu bind:this={contextMenu}>
    <ContextMenuButtons buttons={
        items.map((item) => {
            return {
            name: item.name,
            icon: item.icon ?? null,
            action: () => onAction(item),
        }
    })}/>
</ContextMenu>
