<script lang="ts">
    import {
        type Integration,
        type IntegrationType,
        isLocalIntegrationType,
    } from "@perfice/model/integration/integration";
    import {faGear, faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import {Capacitor} from "@capacitor/core";

    let {
        formId,
        integration,
        integrationType,
        onClick,
        onDelete,
    }: {
        formId: string;
        integration: Integration | undefined;
        integrationType: IntegrationType;
        onClick: (integration: Integration | undefined) => void;
        onDelete: (integration: Integration | undefined) => void;
    } = $props();

    // Integration is null when there is no integration for this type created just yet

    // Whether the integration has been deauthenticated on the remote provider
    let deauthenticated = $derived(
        integration != null && !integrationType.authenticated,
    );
    let localIntegration = $derived(
        isLocalIntegrationType(integrationType.integrationType),
    );
    let supportedOnPlatform = $derived(
        !localIntegration || Capacitor.isNativePlatform(),
    );

    let configurable = $derived(!deauthenticated && supportedOnPlatform);

    function onDeleteClick(e: MouseEvent) {
        e.stopPropagation();
        onDelete(integration);
    }
</script>

<button
        class="p-4 card text-left flex flex-col justify-start"
        class:hover-feedback={configurable}
        disabled={!configurable}
        onclick={() => onClick(integration)}
>
    <div class="flex justify-between">
        <div class="flex gap-2 items-center">
            <img class="w-4 h-4" alt="Integration" src={integrationType.logo}/>
            <h2 class="text-xl font-bold text-gray-600 dark:text-white">{integrationType.name}</h2>
        </div>
        {#if configurable}
            <Fa icon={integration != null ? faGear : faPlus}/>
        {/if}
    </div>
    {#if isLocalIntegrationType(integrationType.integrationType)}
        <p class="text-xs">Available on Android</p>
    {/if}
    {#if integrationType.authenticated || integration == null}
        <ul class="list-disc list-inside mt-2 text-gray-600 max-h-26 overflow-y-scroll scrollbar-hide dark:text-white">
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