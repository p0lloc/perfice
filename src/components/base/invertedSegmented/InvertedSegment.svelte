<script lang="ts">
    import type {Snippet} from "svelte";

    let {children, onClick, active = false}: {
        children: Snippet,
        onClick: () => void,
        active?: boolean
    } = $props();
</script>

<button
        onclick={onClick}
        class="rounded-xl text-center flex gap-1 justify-center items-center {active ? 'bg-white text-black':'text-white hover:bg-white hover:text-black'} flex-1"
        style="min-width: 5rem;"
>
    {@render children?.()}
</button>
