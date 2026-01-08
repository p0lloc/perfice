<script lang="ts">
    import {faGripVertical, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {Snippet} from "svelte";
    import {dragHandle} from "svelte-dnd-action";

    let {icon, text, actions, draggable}: {
        icon?: IconDefinition,
        draggable?: boolean,
        text: string,
        actions: Snippet
    } = $props();
</script>

<div class="default-border p-2 rounded-xl flex justify-between items-center bg-white dark:bg-gray-800">
    <div class="row-gap">
        {#if draggable}
            <span use:dragHandle aria-label="Drag handle for {text}">
                <Fa icon={faGripVertical}/>
            </span>
        {/if}
        {#if icon != null}
            <Fa icon={icon}/>
        {/if}

        {text}
    </div>
    <div class="row-gap dark:text-white text-gray-500">
        {@render actions()}
    </div>
</div>
