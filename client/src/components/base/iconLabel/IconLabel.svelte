<script lang="ts">
    import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {icon, title}: { icon: IconDefinition, title: string } = $props();
</script>
<div class="row-gap label">
    <Fa icon={icon} class="md:w-6"/>
    <p>{title}</p>
</div>
