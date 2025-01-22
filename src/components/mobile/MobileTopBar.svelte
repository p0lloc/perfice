<script lang="ts">
    import type {Snippet} from "svelte";

    let {title, leading, actions}: { title: string, leading?: Snippet, actions?: Snippet } = $props();
</script>

<div class="w-screen border-b md:hidden p-2 flex items-center relative justify-between">
    <div class="z-10">
        {@render leading?.()}
    </div>
    <div class="z-10">
        {@render actions?.()}
    </div>
    <div class="flex w-full justify-center absolute font-bold text-lg">
        {title}
    </div>
</div>
