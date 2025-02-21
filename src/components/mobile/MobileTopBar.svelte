<script lang="ts">
    import type {Snippet} from "svelte";

    let {title, leading, actions}: { title: string, leading?: Snippet, actions?: Snippet } = $props();
</script>

<div class="w-screen max-w-screen border-b md:hidden p-2 flex items-center sticky justify-between min-h-12">
    <div class="z-10 row-gap">
        {@render leading?.()}
    </div>
    <div class="z-10 row-gap">
        {@render actions?.()}
    </div>
    <div class="flex flex-1 w-screen justify-center absolute font-bold text-lg left-0">
        {title}
    </div>
</div>
