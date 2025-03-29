<script lang="ts">

    import {faArrowLeft, faArrowRight, faCheck} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    let {end, onClick, left}: { end: boolean, onClick: () => void, left: boolean } = $props();
    let disabled = $derived(end && left);
</script>

<button {disabled}
        onclick={onClick}
        class="p-4 rounded-md self-center {disabled ? 'bg-gray-200 text-black': 'bg-green-500 pointer-feedback:bg-green-600 text-white'}">
    <Fa icon={left ? faArrowLeft : (end ? faCheck : faArrowRight)}/>
</button>
