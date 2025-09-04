<script lang="ts">
    import {type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {Snippet} from "svelte";

    let {icon, text, actions}: {
        icon?: IconDefinition,
        text: string,
        actions: Snippet
    } = $props();
</script>

<div class="border p-2 rounded-xl flex justify-between items-center bg-white">
    <div class="row-gap">
        {#if icon != null}
            <Fa icon={icon}/>
        {/if}

        {text}
    </div>
    <div class="row-gap text-gray-500">
        {@render actions()}
    </div>
</div>
