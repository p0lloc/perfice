<script lang="ts">
    import type {Snippet} from "svelte";

    let {onClick, children}: { onClick: () => void, children: Snippet } = $props();
</script>

<button
        onclick={onClick}
        class="bg-gray-100 hover:bg-gray-200 w-full rounded-xl border px-4 py-1 group"
>
    {@render children()}
</button>
