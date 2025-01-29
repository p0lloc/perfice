<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faArrowLeft, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

    let {onClick, icon }: { onClick: () => void, icon: IconDefinition } = $props();
</script>

<button class="icon-button" onclick={onClick}>
    <Fa icon={icon}/>
</button>
