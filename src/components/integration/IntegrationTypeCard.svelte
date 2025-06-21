<script lang="ts">
    import type {Integration, IntegrationType} from "@perfice/model/integration/integration";
    import {faGear, faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";

    let {formId, integration, integrationType, onClick, onDelete}: {
        formId: string,
        integration: Integration | undefined,
        integrationType: IntegrationType,
        onClick: (integration: Integration | undefined) => void,
        onDelete: (integration: Integration | undefined) => void
    } = $props();

    let deauthenticated = $derived(integration != null && !integrationType.authenticated);

    function onDeleteClick(e: MouseEvent) {
        e.stopPropagation();
        onDelete(integration);
    }
</script>

<button class="rounded-xl p-4 bg-white border text-left flex flex-col justify-start"
        class:hover-feedback={!deauthenticated}
        onclick={() => onClick(integration)}>
    <div class="flex justify-between">
        <div class="flex gap-2 items-center">
            <img class="w-4 h-4" alt="Integration" src={integrationType.logo}/>
            <h2 class="text-xl font-bold text-gray-600">{integrationType.name}</h2>
        </div>
        {#if !deauthenticated}
            <Fa icon={integration != null ? faGear : faPlus}/>
        {/if}
    </div>
    {#if integrationType.authenticated || integration == null}
        <ul class="list-disc list-inside mt-2 text-gray-600">
            {#each integrationType.entities as def}
                <li>{def.name}</li>
            {/each}
        </ul>
    {:else}
        <div class="flex flex-col gap-2 mt-2">
            <Button onClick={() => onClick(integration)}>Re-authenticate</Button>
            <Button onClick={onDeleteClick} color={ButtonColor.RED}>Delete</Button>
        </div>
    {/if}
</button>