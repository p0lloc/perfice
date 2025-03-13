<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {type IconDefinition} from "@fortawesome/free-solid-svg-icons";

    let {onClick, icon, class: className = ""}: {
        onClick: (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void,
        icon: IconDefinition,
        class?: string
    } = $props();
</script>

<button class="icon-button hover-feedback {className}" onclick={onClick}>
    <Fa icon={icon} class="pointer-events-none"/>
</button>
