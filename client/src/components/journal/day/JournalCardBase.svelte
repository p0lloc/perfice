<script lang="ts">
    import type {Snippet} from "svelte";

    let {onClick, children, selected = false}: {
        onClick: () => void,
        children: Snippet,
        selected?: boolean
    } = $props();
</script>

<button
        onclick={onClick}
        class="dark:bg-gray-800 default-border bg-gray-100 w-full rounded-xl px-4 py-1 group"
        class:hover-feedback={!selected}
        class:bg-gray-300={selected}
>
    {@render children()}
</button>
