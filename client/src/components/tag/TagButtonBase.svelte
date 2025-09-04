<script lang="ts">
    import type {Snippet} from "svelte";

    let {checked, onClick, children}: { checked: boolean, onClick: () => void, children: Snippet } = $props();
</script>

<button
        onclick={onClick}
        class="{checked
    ? 'bg-green-500 pointer-feedback:bg-green-600 text-white border-green-600'
    : 'bg-white pointer-feedback:bg-gray-200 text-black'} border-2 rounded-xl px-3 py-2 text-xs flex justify-between gap-2 items-center"
>
    {@render children()}
</button>
