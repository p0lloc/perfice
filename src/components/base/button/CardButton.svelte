<script lang="ts">
    import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {icon, title, description, onClick}: { icon?: IconDefinition, title: string, description: string, onClick: () => void } = $props();
</script>
<button class="border px-4 flex items-center gap-4 w-full rounded-xl hover-feedback h-24" onclick={onClick}>
    {#if icon != null}
        <Fa icon={icon} size="2.0x"/>
    {/if}
    <div class="text-left">
        <h2 class="text-xl font-bold">{title}</h2>
        <p>{description}</p>
    </div>
</button>
