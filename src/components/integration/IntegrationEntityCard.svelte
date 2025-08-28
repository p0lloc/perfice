<script lang="ts">
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {IntegrationEntityDefinition} from "@perfice/model/integration/integration";

    let {entity, onClick}: { entity: IntegrationEntityDefinition, onClick: () => void } = $props();
</script>

<button class="rounded-xl p-4 bg-white border text-left hover-feedback flex flex-col justify-start"
        onclick={onClick}>
    <div class="flex justify-between">
        <div class="flex gap-2 items-center">
            <h2 class="text-xl font-bold text-gray-600">{entity.name}</h2>
        </div>
        <Fa icon={faPlus}/>
    </div>
    <ul class="list-disc list-inside mt-2 text-gray-600">
        {#each Object.values(entity.fields) as def}
            <li>{def}</li>
        {/each}
    </ul>
</button>