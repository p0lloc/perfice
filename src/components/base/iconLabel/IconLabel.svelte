<script lang="ts">
    import {type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {Snippet} from "svelte";

    let {icon, title, children}: { icon: IconDefinition, title: string, children: Snippet } = $props();
</script>

<div class="row-between mt-4">
    <div class="row-gap label">
        <Fa icon={icon}/>
        <p>{title}</p>
    </div>

    {@render children()}
</div>
