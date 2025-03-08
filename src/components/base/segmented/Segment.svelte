<script lang="ts">
    import type {Snippet} from "svelte";

    let {class: className = '', children, onClick, inverted = false, active = false}: {
        children: Snippet,
        onClick: () => void,
        active?: boolean,
        inverted?: boolean,
        class?: string
    } = $props();

    function getButtonClass(inverted: boolean) {
        if (inverted) {
            return active ? "active-inverted" : "inactive-inverted";
        } else {
            return active ? "active" : "inactive";
        }
    }
</script>

<button
        onclick={onClick}
        class="{getButtonClass(inverted)} text-center flex gap-1 [&:last-child]:rounded-r-xl [&:first-child]:rounded-l-xl justify-center items-center flex-1 {className}"
        style:min-width="5rem"
>
    {@render children?.()}
</button>

<style>
    .active {
        @apply bg-green-600 text-white;
    }

    .inactive {
        @apply text-black;
    }

    .active-inverted {
        @apply bg-white text-black;
    }

    .inactive-inverted {
        @apply text-white pointer-feedback:bg-white pointer-feedback:text-black;
    }
</style>
