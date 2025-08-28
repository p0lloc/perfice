<script lang="ts" generics="T">
    import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import {DROPDOWN_BUTTON_HEIGHT, type DropdownMenuItem} from "@perfice/model/ui/dropdown";

    let contextMenu: ContextMenu;
    let button: HTMLButtonElement;
    let {
        value,
        items,
        small = false,
        search = false,
        class: className = '',
        noneText = 'Select value',
        onChange,
        disabled = false,
        compareFunction = (a, b) => a == b
    }: {
        value: T,
        items: DropdownMenuItem<T>[],
        class?: string,
        onChange?: (v: T) => void,
        noneText?: string,
        small?: boolean,
        search?: boolean,
        disabled?: boolean,
        compareFunction?: (a: T, b: T) => boolean
    } = $props();

    let searchInput: HTMLInputElement;
    let searchValue = $state("");

    function getSelectedItemPosition() {
        if (selectedItem == null) return 0;
        return items.indexOf(selectedItem) * DROPDOWN_BUTTON_HEIGHT;
    }

    function open(e: MouseEvent) {
        if (disabled) return;

        if (searchInput != null) {
            searchInput.focus();
            searchInput.setSelectionRange(-1, -1);
        }

        contextMenu.openFromClick(e.target as HTMLElement, button, true, getSelectedItemPosition());
    }

    function onAction(e: DropdownMenuItem<T>) {
        e.action?.();
        onChange?.(e.value);
        searchValue = e.name;
    }

    function onSearchChange() {

    }

    let menuItems = $derived.by(() => {
        let filterFunction = search
            ? (i: DropdownMenuItem<T>) => i.name.toLowerCase().includes(searchValue.toLowerCase()) :
            (_: DropdownMenuItem<T>) => true;

        return items.filter(filterFunction)
            .map((item) => {
                return {
                    name: item.name,
                    icon: item.icon ?? null,
                    action: () => onAction(item),
                    separated: item.separated,
                }
            })
    });
    let selectedItem: DropdownMenuItem<T> | undefined = $derived(items.find(i => compareFunction(i.value, value)));
</script>
<button class="border min-h-8 min-w-6 bg-white rounded-xl {small ? 'px-2 py-1': 'px-3 py-2'} flex items-center justify-between {className} gap-2 context-menu-button"
        onclick={open} bind:this={button}>
    <div class="row-gap pointer-events-none">
        {#if selectedItem != null}
            {#if selectedItem.icon != null}
                <Fa icon={selectedItem.icon} class="w-4"/>
            {/if}
            {#if search}
                <input type="text" class="outline-none input border-none"
                       bind:value={searchValue}
                       placeholder={selectedItem.name}
                       bind:this={searchInput}/>
            {:else}
                {selectedItem.name}
            {/if}
        {:else}
            <span class="text-gray-500">{noneText}</span>
        {/if}
    </div>
    <Fa icon={faChevronDown} class="text-xs pointer-events-none"/>
</button>

<ContextMenu bind:this={contextMenu}>
    <ContextMenuButtons buttons={menuItems}/>
</ContextMenu>

<style>
    input::placeholder {
        color: black;
    }
</style>