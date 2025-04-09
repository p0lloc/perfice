<script lang="ts">
    import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {Snippet} from "svelte";

    let {icon, title, description, class: className = 'bg-white', iconClass = 'w-8', suffix}: {
        icon?: IconDefinition,
        title: string,
        description: string,
        iconClass?: string,
        class?: string,
        suffix?: Snippet
    } = $props();
</script>

<div class="border p-4 flex justify-between gap-4 w-full rounded-xl {className}">
    <div class="flex items-center gap-2">
        <span class={iconClass}>
            {#if icon != null}
                <Fa icon={icon} size="2.0x"/>
            {/if}
        </span>
        <div class="text-left">
            <h2 class="text-xl font-bold">{title}</h2>
            <p>{description}</p>
        </div>
    </div>
    <div>
        {@render suffix?.()}
    </div>
</div>
