<script lang="ts">
    import {integrations} from "@perfice/stores.js";
    import type {Integration, IntegrationType} from "@perfice/model/integration/integration.js";
    import IntegrationTypeCard from "@perfice/components/integration/IntegrationTypeCard.svelte";
    import {App as CapacitorApp} from "@capacitor/app";
    import {onMount} from "svelte";

    let {formId, create, edit}: {
        formId: string,
        create: (integrationType: string) => void,
        edit: (integrationId: string) => void
    } = $props();
    /*let form = $state<Form | undefined>(undefined);*/

    onMount(async () => {
        await integrations.load();
        // form = await forms.getFormById(formId);
    });

    function getConnectedIntegration(integrations: Integration[], integrationType: string) {
        return integrations.find(i => i.integrationType == integrationType && i.formId == formId);
    }

    function onTypeClick(integrationType: IntegrationType, integration: Integration | undefined) {
        if (!integrationType.authenticated) {
            integrations.authenticateIntegration(integrationType.integrationType);

            let appStateRan = false;
            // When user returns back to app, check if integration was successfully authenticated
            // If so, re-rerun the click action
            CapacitorApp.addListener('appStateChange', async ({isActive}) => {
                if (!isActive || appStateRan) return;
                appStateRan = true; // There is no way to unregister listeners, so we need to make sure we don't run this twice

                if (!(await integrations.fetchAuthenticationStatus(integrationType.integrationType))) return;
                integrationType.authenticated = true;
                onTypeClick(integrationType, integration);
            });

            return;
        }

        if (integration == null) {
            create(integrationType.integrationType);
        } else {
            edit(integration.id);
        }
    }

    function onTypeDeleteClick(integration: Integration | undefined) {
        if (integration == null) return;
        integrations.deleteIntegrationById(integration?.id ?? "");
    }
</script>


<div class="md:mt-8">
    <!--    <Title title={`Integrations for ${form?.name ?? "Form"}`} icon={faGears}/>-->
    {#await $integrations then integrationData}
        {#if !integrationData.enabled}
            <p class="mt-4">Integrations must first be enabled in settings by creating an account.</p>
        {:else}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {#each integrationData.integrationTypes as type}
                    <IntegrationTypeCard integrationType={type}
                                         formId={formId}
                                         onClick={(integration) => onTypeClick(type, integration)}
                                         onDelete={(integration) => onTypeDeleteClick(integration)}
                                         integration={getConnectedIntegration(integrationData.integrations, type.integrationType)}/>
                {/each}
            </div>
        {/if}
    {/await}
</div>