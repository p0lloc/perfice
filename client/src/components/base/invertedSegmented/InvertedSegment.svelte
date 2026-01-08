<script lang="ts">
    import type {Snippet} from "svelte";

    let {
        children,
        onClick,
        active = false,
        class: className = "",
    }: {
        children: Snippet;
        onClick: () => void;
        class?: string;
        active?: boolean;
    } = $props();
</script>

<button
        onclick={onClick}
        class="rounded-xl text-center flex gap-1 text-sm justify-center items-center {active
        ? 'active'
        : 'inactive'} text-ellipsis flex-1 px-1 md:px-2 {className}"
>
    {@render children?.()}
</button>

<style>
    @reference "@perfice/app.css";
    .active {
        @apply bg-white text-black;
    }

    .inactive {
        @apply text-white pointer-feedback:bg-white pointer-feedback:text-black;
    }
</style>
