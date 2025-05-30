<script lang="ts">
    import type {Integration, IntegrationType} from "@perfice/model/integration/integration";
    import {faGear, faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {formId, integration, integrationType, onClick}: {
        formId: string,
        integration: Integration | undefined,
        integrationType: IntegrationType,
        onClick: (integration: Integration | undefined) => void
    } = $props();
</script>

<button class="rounded-xl p-4 bg-white border text-left hover-feedback flex flex-col justify-start"
        onclick={() => onClick(integration)}>
    <div class="flex justify-between">
        <div class="flex gap-2 items-center">
            <img class="w-4 h-4" alt="Integration" src={integrationType.logo}/>
            <h2 class="text-xl font-bold text-gray-600">{integrationType.name}</h2>
        </div>
        <Fa icon={integration != null ? faGear : faPlus}/>
    </div>
    <ul class="list-disc list-inside mt-2 text-gray-600">
        {#each integrationType.entities as def}
            <li>{def.name}</li>
        {/each}
    </ul>
</button>