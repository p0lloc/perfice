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
        class="rounded-xl text-center flex gap-1 justify-center items-center {active ? 'active':'inactive'} text-ellipsis flex-1 px-1"
>
    {@render children?.()}
</button>

<style>
    .active {
        @apply bg-white text-black;
    }

    .inactive {
        @apply text-white pointer-feedback:bg-white pointer-feedback:text-black;
    }
</style>
