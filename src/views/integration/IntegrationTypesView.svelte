<script lang="ts">
    import {faGears} from "@fortawesome/free-solid-svg-icons";
    import Title from "@perfice/components/base/title/Title.svelte";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import {forms, integrations} from "@perfice/stores.js";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {Integration, IntegrationType} from "@perfice/model/integration/integration.js";
    import IntegrationTypeCard from "@perfice/components/integration/IntegrationTypeCard.svelte";
    import {navigate} from "@perfice/app";
    import {App as CapacitorApp} from "@capacitor/app";
    import type {Form} from "@perfice/model/form/form";
    import {onMount} from "svelte";

    let {params}: { params: Record<string, string> } = $props();

    let form = $state<Form | undefined>(undefined);

    onMount(async () => {
        form = await forms.getFormById(params.formId);
    });

    function getConnectedIntegration(integrations: Integration[], integrationType: string) {
        return integrations.find(i => i.integrationType == integrationType && i.formId == params.formId);
    }

    function onTypeClick(integrationType: IntegrationType, integration: Integration | undefined) {
        if (!integrationType.authenticated) {
            integrations.authenticateIntegration(integrationType.integrationType);

            let appStateRan = false;
            // When user returns back to app, check if integration was successfully authenticated
            // If so, re-rerun the click action
            CapacitorApp.addListener('appStateChange', ({isActive}) => {
                if (!isActive || appStateRan) return;
                appStateRan = true; // There is no way to unregister listeners, so we need to make sure we don't run this twice

                if (!integrations.fetchAuthenticationStatus(integrationType.integrationType)) return;
                integrationType.authenticated = true;
                onTypeClick(integrationType, integration);
            });

            return;
        }

        if (integration == null) {
            navigate(`/integrations/${params.formId}/create/${integrationType.integrationType}`);
        } else {
            navigate(`/integrations/edit/${integration.id}`);
        }
    }
</script>


<MobileTopBar title="Integrations"/>
<div class="center-view md:mt-8 md:p-0 p-2 main-content">
    <Title title={`Integrations for ${form?.name ?? "Form"}`} icon={faGears}/>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {#await $integrations then integrationData}
            {#each integrationData.integrationTypes as type}
                <IntegrationTypeCard integrationType={type}
                                     formId={params.formId}
                                     onClick={(integration) => onTypeClick(type, integration)}
                                     integration={getConnectedIntegration(integrationData.integrations, type.integrationType)}/>
            {/each}
        {/await}
    </div>
</div>