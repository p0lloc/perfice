<script lang="ts">
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import type {Snippet} from "svelte";
    import {type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {title, icon, children, actions}: {
        title?: string,
        icon?: string | IconDefinition,
        children: Snippet, actions?: Snippet
    } = $props();
</script>

<div class="card w-full h-full items-start flex flex-col">
    {#if title != null && icon != null}
        <div class="border-b dark-border basic self-stretch p-2 font-bold dark:text-white text-gray-600 row-between">
            <div class="row-gap">
                {#if typeof icon == "string"}
                    <Icon name={icon} class="text-green-500 text-xl"/>
                {:else}
                    <Fa class="text-green-500" icon={icon}/>
                {/if}
                <span>{title}</span>
            </div>
            {@render actions?.()}
        </div>
    {/if}
    <div class="overflow-y-scroll scrollbar-hide w-full min-h-14">
        {@render children?.()}
    </div>
</div>
