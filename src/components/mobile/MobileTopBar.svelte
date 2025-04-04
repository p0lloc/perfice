<script lang="ts">
    import type {Snippet} from "svelte";
    import DrawerOpenButton from "@perfice/components/sidebar/drawer/DrawerOpenButton.svelte";

    let {title, leading, actions}: { title: string, leading?: Snippet, actions?: Snippet } = $props();
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
    <div class="flex flex-1 w-screen justify-center absolute font-bold text-lg left-0">
        {title}
    </div>
</div>
