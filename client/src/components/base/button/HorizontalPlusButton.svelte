<script lang="ts">
    import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {onClick}: { onClick: (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void } = $props();
</script>
<button
        class="horizontal-add-button mt-4"
        onclick={onClick}
>
    <Fa icon={faPlusCircle} class="pointer-events-none"/>
</button>
