<script lang="ts">
    import type {Snippet} from "svelte";
    import DrawerOpenButton from "@perfice/components/sidebar/drawer/DrawerOpenButton.svelte";

    let {title, leading, actions, leftTitleOffset}: {
        title: string,
        leading?: Snippet,
        leftTitleOffset?: string,
        actions?: Snippet
    } = $props();
</script>

<div class="w-screen max-w-screen border-b md:hidden p-2 flex items-center sticky z-10 justify-between min-h-12 bg-white">
    <div class="z-10 row-gap">
        {#if leading != null}
            {@render leading()}
        {:else}
            <DrawerOpenButton/>
        {/if}
    </div>
    <div class="z-10 row-gap">
        {@render actions?.()}
    </div>
    <div class="flex flex-1 w-screen {leftTitleOffset ?? 'justify-center left-0'} absolute font-bold text-lg">
        {title}
    </div>
</div>
