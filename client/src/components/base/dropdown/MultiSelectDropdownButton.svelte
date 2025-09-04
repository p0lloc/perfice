<script lang="ts" generics="T">
    import {faChevronDown, faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown.js";
    import Fa from "svelte-fa";

    let contextMenu: ContextMenu;
    let button: HTMLButtonElement;
    let {value, items, small = false, class: className = '', noneText = 'All', onChange, disabled = false}: {
        value: T[],
        items: DropdownMenuItem<T>[],
        class?: string,
        onChange?: (v: T[]) => void,
        noneText?: string,
        small?: boolean,
        disabled?: boolean
    } = $props();

    function open(e: MouseEvent) {
        if (disabled) return;
        contextMenu.openFromClick(e.target as HTMLElement, button, true);
    }

    function onAction(e: DropdownMenuItem<T>) {
        e.action?.();

        if (value.includes(e.value)) {
            onChange?.(value.filter(v => v != e.value));
        } else {
            onChange?.([...value, e.value]);
        }
    }

    let selectedItems: DropdownMenuItem<T>[] = $derived(value.map(v => items.find(i => i.value == v)!));
</script>

<button class="border min-h-8 min-w-6 rounded-xl {small ? 'px-2 py-1': 'px-3 py-2'} flex items-center justify-between {className} gap-2 context-menu-button"
        onclick={open} bind:this={button}>
    <div class="row-gap pointer-events-none">
        {#if selectedItems.length > 0}
            {selectedItems.map(i => i.name).join(", ")}
        {:else}
            <span class="text-gray-500">{noneText}</span>
        {/if}
    </div>
    <Fa icon={faChevronDown} class="text-xs pointer-events-none"/>
</button>

<ContextMenu bind:this={contextMenu}>
    <ContextMenuButtons buttons={
        items.map((item) => {
            return {
            name: item.name,
            icon: value.includes(item.value) ? faTimes : faPlus,
            action: () => onAction(item),
            separated: item.separated,
        }
    })}/>
</ContextMenu>
