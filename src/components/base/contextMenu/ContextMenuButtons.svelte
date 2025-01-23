<script lang="ts">
    import type {ContextMenuButton} from "@perfice/model/ui/context-menu";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {buttons}: { buttons: ContextMenuButton[] } = $props();
</script>

<div class="flex flex-col">
    {#each buttons as button}
        <button class="p-2 [&:first-child]:rounded-t-xl [&:last-child]:rounded-b-xl hover:bg-gray-100 row-gap" onclick={() => button.action()}>
            {#if button.icon != null}
                <Fa icon={button.icon} class="w-4"/>
            {/if}
            {button.name}
        </button>
    {/each}
</div>
