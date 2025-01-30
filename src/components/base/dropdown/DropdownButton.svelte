<script lang="ts" generics="T">
    import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";

    let contextMenu: ContextMenu;
    let button: HTMLButtonElement;
    let {value, items, class: className = ''}: { value: T, items: DropdownMenuItem<T>[], class?: string } = $props();

    function open(e: MouseEvent) {
        contextMenu.openFromClick(e, button, true);
    }

    let selectedItem: DropdownMenuItem<T> | undefined = $derived(items.find(i => i.value == value));
</script>
<button class="border rounded-xl px-3 py-2 flex items-center justify-between {className} gap-2 context-menu-button" onclick={open} bind:this={button}>
    {#if selectedItem != null}
        <div class="row-gap pointer-events-none">
            {#if selectedItem.icon != null}
                <Fa icon={selectedItem.icon} class="w-4"/>
            {/if}
            {selectedItem.name}
        </div>
    {/if}
    <Fa icon={faChevronDown} class="text-xs pointer-events-none"/>
</button>
<ContextMenu bind:this={contextMenu}>
    <ContextMenuButtons buttons={
        items.map((t) => {
            return {
            name: t.name,
            icon: t.icon,
            action: t.action,
        }
    })}/>
</ContextMenu>
